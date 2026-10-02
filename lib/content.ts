import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { contentPath, hasContent, type ContentKind } from '@/lib/content-gate';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] };

const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string().min(1) }),
  z.object({ type: z.literal('h2'), text: z.string().min(1) }),
  z.object({ type: z.literal('h3'), text: z.string().min(1) }),
  z.object({
    type: z.literal('ul'),
    items: z.array(z.string().min(1)).min(1),
  }),
]);

const docSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(['draft', 'published']),
  note: z.string().nullable(),
  blocks: z.array(blockSchema).min(1),
});

export type ContentDoc = z.infer<typeof docSchema>;

function parseFrontmatter(source: string): {
  fields: Record<string, string>;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match?.[1]) throw new Error('Content file is missing frontmatter');
  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const split = line.indexOf(':');
    if (split === -1) continue;
    const key = line.slice(0, split).trim();
    const value = line.slice(split + 1).trim();
    if (key) fields[key] = value;
  }
  return { fields, body: source.slice(match[0].length) };
}

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let list: string[] | null = null;

  function flushParagraph() {
    const text = paragraph.join(' ').trim();
    paragraph = [];
    if (text) blocks.push({ type: 'p', text });
  }

  function flushList() {
    if (list && list.length > 0) blocks.push({ type: 'ul', items: list });
    list = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      flushParagraph();
      list ??= [];
      list.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.length === 0) {
      flushParagraph();
      continue;
    }
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function parseContent(source: string): ContentDoc {
  const { fields, body } = parseFrontmatter(source);
  return docSchema.parse({
    title: fields.title ?? '',
    summary: fields.summary ?? '',
    status: fields.status ?? 'draft',
    note: fields.note ?? null,
    blocks: parseBlocks(body),
  });
}

export function loadContent(
  kind: ContentKind,
  slug: string,
): ContentDoc | null {
  if (!hasContent(kind, slug)) return null;
  return parseContent(readFileSync(contentPath(kind, slug), 'utf8'));
}

export function faqItems(doc: ContentDoc): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  let inFaq = false;
  let current: { question: string; answer: string } | null = null;
  for (const block of doc.blocks) {
    if (block.type === 'h2' && block.text.toLowerCase() === 'faq') {
      inFaq = true;
      continue;
    }
    if (!inFaq) continue;
    if (block.type === 'h2') break;
    if (block.type === 'h3') {
      if (current) items.push(current);
      current = { question: block.text, answer: '' };
      continue;
    }
    if (current && block.type === 'p') {
      current.answer = current.answer
        ? `${current.answer} ${block.text}`
        : block.text;
    }
  }
  if (current?.answer) items.push(current);
  return items;
}
