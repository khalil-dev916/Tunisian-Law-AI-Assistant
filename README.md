# Tunisian Law AI Assistant

An AI-powered legal assistant for Tunisian law, built with Next.js 16, Groq API, and a beautiful custom UI.

## Features

- **Beautiful UI**: Custom dark theme with gold accents, animated particles, and scales of justice animation
- **Multi-language**: Supports English, French, and Arabic (RTL)
- **Legal Knowledge Base**: Loads Tunisian law from JSON documents (Mجلة الأحوال الشخصية)
- **Chat Interface**: Real-time chat with AI legal assistant
- **Image Filtering**: Automatically filters out image content from messages (Groq models are text-only)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Groq API (openai/gpt-oss-20b)
- **Styling**: Tailwind CSS v4 + custom CSS
- **Language**: TypeScript
- **Document Processing**: Mammoth (.doc files), custom chunking

## Project Structure

```
tunisian-law-ai/
├── public/
│   └── index.html           # Main landing page (beautiful blue/green UI)
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Chat API endpoint
│   │   ├── chat/page.tsx        # Chat interface page
│   │   ├── about/page.tsx       # About page
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── page.tsx             # Redirects to chat
│   ├── components/
│   │   └── LangProvider.tsx     # Language context provider
│   └── lib/
│       └── documents.ts         # Document loading & chunking
├── legal-knowledge.json         # Tunisian law knowledge base
├── documents/                   # Legal documents (.doc files)
├── .env.local                   # Environment variables
└── next.config.ts               # Next.js config
```

## Getting Started

### Prerequisites

- Node.js 18+
- Groq API key from [console.groq.com](https://console.groq.com)

### Installation

```bash
cd tunisian-law-ai
npm install
```

### Configuration

Create `.env.local` with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - shows the main landing page with cards.
Click "Legal Assistant Bot" card to open the chat interface.

### Production Build

```bash
npm run build
npm start
```

## API Endpoint

**POST** `/api/chat?lang=ar|fr|en`

Request body:
```json
{
  "messages": [
    {"role": "user", "content": "Your legal question"}
  ]
}
```

Response:
```json
{
  "message": "AI response in requested language"
}
```

## Knowledge Base

The system loads legal content from:
- `legal-knowledge.json` - Pre-loaded Tunisian law (Mجلة الأحوال الشخصية)
- `documents/` folder - .doc files (processed via Mammoth)
- Additional JSON/JSONL files if present

Content is chunked, keyword-extracted, and scored for relevance using a simple TF-like algorithm.

## Language Support

| Language | Code | Direction |
|----------|------|-----------|
| English  | `en` | LTR       |
| French   | `fr` | LTR       |
| Arabic   | `ar` | RTL       |

Language is detected automatically from the query, or can be forced via `?lang=` parameter.

## Image Handling

The chat API automatically filters out image content from messages. Only `text` type parts are sent to Groq (which doesn't support vision models). This prevents the error:
> "Cannot read 'image.png' (this model does not support image input)"

## Customization

### Change AI Model

Edit `src/app/api/chat/route.ts`:
```typescript
model: 'openai/gpt-oss-20b'  // or other Groq model
```

### Add Documents

Place `.doc` files in `documents/` folder - they're auto-loaded on server start.

### Modify UI

The main landing page is `public/index.html` (single-file HTML with embedded CSS/JS).
The chat page is `src/app/chat/page.tsx`.

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add `GROQ_API_KEY` environment variable
4. Deploy

## License

MIT License - Feel free to use for educational/legal assistance purposes.

## Disclaimer

This tool provides general legal information only. It is not a substitute for professional legal advice. Consult a qualified attorney for specific legal matters.