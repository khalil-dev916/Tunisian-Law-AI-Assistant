'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Send, AlertCircle, ChevronLeft, Globe } from 'lucide-react';
import { useLang } from '@/components/LangProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const messages = {
  ar: {
    welcome: 'مرحباً! أنا مساعدكم القانوني الذكي. اسألوني عن أي سؤال متعلق بالقانون التونسي.',
    placeholder: 'اكتب سؤالك هنا...',
    title: 'المحكمة',
    subtitle: 'مساعد قانوني ذكي',
  },
  fr: {
    welcome: 'Bonjour! Je suis votre assistant juridique. Posez-moi vos questions sur le droit tunisien.',
    placeholder: 'Votre question...',
    title: 'Juridique',
    subtitle: 'Assistant juridique',
  },
};

export default function ChatPage() {
  const { lang, setLang, dir } = useLang();
  const t = messages[lang];
  const isRTL = dir === 'rtl';
  
  const [msgs, setMsgs] = useState<Message[]>([
    { role: 'assistant', content: t.welcome }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  useEffect(() => {
    setMsgs([{ role: 'assistant', content: t.welcome }]);
  }, [lang, t.welcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError('');

    setMsgs(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch(`/api/chat?lang=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs.concat([{ role: 'user', content: userMessage }])
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error');
      if (!data.message) throw new Error('No response');

      setMsgs(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ChevronLeft className={`w-5 h-5 text-slate-600 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <div className="w-9 h-9 bg-emerald-700 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">{t.title}</h1>
              <p className="text-xs text-emerald-600">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')} className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'FR' : 'AR'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {msgs.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-white border border-slate-200 text-slate-800'}`}>
                <p className="whitespace-pre-wrap leading-relaxed" style={{ textAlign: isRTL ? 'right' : 'left' }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder={t.placeholder} 
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 placeholder:text-slate-400" 
            disabled={loading}
            dir={dir}
          />
          <button type="submit" disabled={loading || !input.trim()} className="p-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}