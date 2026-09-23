import { NextRequest, NextResponse } from 'next/server';
import { loadDocuments, findRelevantChunks } from '@/lib/documents';

let initialized = false;

async function init() {
  if (!initialized) {
    await loadDocuments();
    initialized = true;
  }
}

function detectLanguage(text: string): string {
  const arabicChars = /[\u0600-\u06FF]/;
  if (arabicChars.test(text)) return 'ar';
  return 'fr';
}

const systemAR = `You are a Tunisian legal assistant. Answer about Tunisian law only. If question is not about Tunisian law, say you can only answer legal questions related to Tunisian law.`;

const systemFR = `You are a Tunisian legal assistant. Answer about Tunisian law only. If question is not about Tunisian law, say you can only answer legal questions related to Tunisian law.`;

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  await init();
  
  const apiKey = process.env.GROQ_API_KEY;
  
  const urlLang = request.nextUrl.searchParams.get('lang') as 'ar' | 'fr' | null;
  
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  
  const rawMessages = body.messages || [];
  const messages = rawMessages.map((msg: unknown) => {
    const m = msg as Record<string, unknown>;
    if (typeof m?.content === 'string') {
      return { role: m.role, content: m.content };
    }
    if (Array.isArray(m?.content)) {
      const textParts = m.content
        .filter((part: unknown) => typeof part === 'object' && part !== null && (part as Record<string, unknown>).type === 'text')
        .map((part: unknown) => (part as Record<string, unknown>).text)
        .join('\n');
      return { role: m.role, content: textParts };
    }
    return { role: m?.role || 'user', content: '' };
  }).filter((m: { content: string }) => m.content.trim().length > 0);
  
  console.log('[Chat API] Received messages:', JSON.stringify(messages, null, 2));
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return NextResponse.json({ error: 'API key missing' }, { status: 400 });
  }

  const question = messages[messages.length - 1]?.content || '';
  const userLang = urlLang || detectLanguage(question);
  
  const relevantDocs = findRelevantChunks(question, 3);
  let context = relevantDocs.join('\n\n---\n\n');
  if (context.length > 3500) context = context.slice(0, 3500);
  
  const systemPrompt = userLang === 'ar' ? systemAR : systemFR;
  const respondIn = userLang === 'ar' ? 'Answer in Arabic.' : 'Answer in French.';

  try {
    const fullContext = context.length > 10
      ? (userLang === 'ar' 
        ? `Tunisian legal information:\n${context}`
        : `Base de connaissances juridiques tunisiennes:\n${context}`)
      : (userLang === 'ar'
        ? `No information available. Say: Sorry, I don't have information about this.`
        : `Aucune information disponible. Dis: Desole, je n'ai pas d'information sur ce sujet.`);
    
    const chatMessages = [
      { role: 'system', content: systemPrompt + '\n\n' + fullContext + '\n\n' + respondIn },
      ...messages.slice(-6),
    ];

    const fallbackMsg = userLang === 'ar'
      ? 'عذراً، تعذر توليد رد حالياً. حاول مرة أخرى.'
      : 'Désolé, impossible de générer une réponse pour le moment. Réessayez.';

    let groqResponse: Response | null = null;
    let result: Record<string, unknown> | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: chatMessages,
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      try {
        result = await groqResponse.json() as Record<string, unknown>;
      } catch {
        result = null;
      }

      if (groqResponse.status === 429 && attempt < 3) {
        await new Promise(r => setTimeout(r, 5000 * (attempt + 1)));
        continue;
      }
      break;
    }

    if (!groqResponse || !result) {
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 });
    }

    if (!groqResponse.ok) {
      console.error('Groq error:', result);
      const errObj = result.error as { message?: string } | undefined;
      return NextResponse.json({ error: errObj?.message || 'Error' }, { status: groqResponse.status === 429 ? 429 : 500 });
    }

    const choices = result.choices as Array<{ message?: { content?: string } }> | undefined;
    const content = choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ message: fallbackMsg });
    }

    return NextResponse.json({
      message: content,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}