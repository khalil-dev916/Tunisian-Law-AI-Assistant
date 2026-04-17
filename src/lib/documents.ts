import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

export interface DocumentChunk {
  id: string;
  source: string;
  content: string;
  keywords: string[];
}

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

let chunks: DocumentChunk[] = [];

async function extractTextFromDoc(docPath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(docPath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    return '';
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/[\s\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/);
  const unique = [...new Set(words.filter(w => w.length > 2))];
  return unique.slice(0, 20);
}

function createChunks(text: string, source: string): DocumentChunk[] {
  const cleaned = cleanText(text);
  if (cleaned.length < 100) return [];

  const docChunks: DocumentChunk[] = [];
  const sentences = cleaned.split(/[.!?\n]+/);
  
  let currentChunk = '';
  let chunkId = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    
    if (currentChunk.length + trimmed.length > CHUNK_SIZE && currentChunk.length > 200) {
      docChunks.push({
        id: `${source}-${chunkId++}`,
        source,
        content: cleanText(currentChunk),
        keywords: extractKeywords(currentChunk),
      });
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmed;
    }
  }

  if (currentChunk.length > 50) {
    docChunks.push({
      id: `${source}-${chunkId++}`,
      source,
      content: cleanText(currentChunk),
      keywords: extractKeywords(currentChunk),
    });
  }

  return docChunks;
}

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'documents');
const KB_FILE = path.join(PROJECT_ROOT, 'legal-knowledge.json');

export async function loadDocuments(): Promise<void> {
  chunks = [];

  try {
    const docFiles = await fs.readdir(DOCS_DIR);
    const docPaths = docFiles.filter(f => f.endsWith('.doc'));

    for (const file of docPaths) {
      const filePath = path.join(DOCS_DIR, file);
      const text = await extractTextFromDoc(filePath);
      
      if (text.length > 100) {
        const docChunks = createChunks(text, file.replace('.doc', ''));
        chunks.push(...docChunks);
      }
    }
  } catch {}

  try {
    const kbData = await fs.readFile(KB_FILE, 'utf-8');
    const kb = JSON.parse(kbData);
    for (const item of kb) {
      if (item.content && item.content.length > 100) {
        const docChunks = createChunks(item.content, item.source || 'مقتضيات شخصية');
        chunks.push(...docChunks);
      }
    }
  } catch {}

  const docsPath = path.join(DOCS_DIR, 'documents.jsonl');
  try {
    const docsContent = await fs.readFile(docsPath, 'utf-8');
    const lines = docsContent.trim().split('\n');
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        const text = item.text || item.content || '';
        if (text.length > 100) {
          const docChunks = createChunks(text, item.title || item.category || 'قانون');
          chunks.push(...docChunks);
        }
      } catch {}
    }
  } catch {}

  const corpusPath = path.join(DOCS_DIR, 'law_corpus.json');
  try {
    const corpusData = await fs.readFile(corpusPath, 'utf-8');
    const corpus = JSON.parse(corpusData);
    for (const item of corpus) {
      const text = item.text || item.content || '';
      if (text.length > 100) {
        const docChunks = createChunks(text, item.source_file || item.source || item.category || 'قانون');
        chunks.push(...docChunks);
      }
    }
  } catch {}

  console.log('Loaded', chunks.length, 'document chunks');
}

function calculateScore(text: string, query: string): number {
  const q = query.toLowerCase();
  const words = q.split(/\s+/);
  
  let score = 0;
  for (const word of words) {
    if (text.toLowerCase().includes(word)) score += 10;
  }

  const arabicWords = q.match(/[\u0600-\u06FF]+/g) || [];
  for (const word of arabicWords) {
    if (text.includes(word)) score += 15;
  }

  return score;
}

export function findRelevantChunks(query: string, limit = 5): string[] {
  const scored = chunks.map(chunk => ({
    chunk,
    score: calculateScore(chunk.content, query),
  }));

  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, limit);
  return selected.map(s => s.chunk.content);
}

export function getAllChunks(): DocumentChunk[] {
  return chunks;
}