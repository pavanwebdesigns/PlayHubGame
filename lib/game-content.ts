import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { HUB_NAMES } from '@/config/taxonomy';
import { contentPath, hasContent } from '@/lib/content-gate';
import type { GameRecord } from '@/lib/catalog/types';

const controlSchema = z.object({
  desktop: z.array(z.object({ key: z.string().min(1), action: z.string().min(1) })),
  phone: z.array(z.object({ gesture: z.string().min(1), action: z.string().min(1) })),
});

const faqSchema = z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).max(5);

export const gameContentSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(140).max(160),
    status: z.enum(['draft', 'published']),
    author: z.string(),
    playedOn: z.string(),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    controls: controlSchema,
    faq: faqSchema,
    tags: z.array(z.string()).default([]),
    sections: z.array(z.string()),
  })
  .superRefine((doc, ctx) => {
    if (doc.status !== 'published') return;
    if (!doc.author.trim()) {
      ctx.addIssue({ code: 'custom', message: 'published game needs an author', path: ['author'] });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.playedOn)) {
      ctx.addIssue({
        code: 'custom',
        message: 'published game needs the date it was played',
        path: ['playedOn'],
      });
    }
    if (doc.faq.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'published game needs 2 to 5 FAQ items', path: ['faq'] });
    }
    for (const heading of ['About', 'How to play', 'Tips', "Who it's for"]) {
      if (!doc.sections.includes(heading)) {
        ctx.addIssue({
          code: 'custom',
          message: `published game needs a ${heading} section`,
          path: ['sections'],
        });
      }
    }
  });

export type GameContent = z.infer<typeof gameContentSchema>;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function fieldMap(source: string): Record<string, string> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) throw new Error('Game content is missing frontmatter');
  const fields: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const split = line.indexOf(':');
    if (split === -1 || line.startsWith(' ')) continue;
    const key = line.slice(0, split).trim();
    fields[key] = unquote(line.slice(split + 1));
  }
  return fields;
}

function sectionHeadings(source: string): string[] {
  const body = source.split(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)[1] ?? '';
  return [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]?.trim() ?? '');
}

export function parseGameContent(source: string): GameContent {
  const fields = fieldMap(source);
  const controls = JSON.parse(fields.controls ?? '{"desktop":[],"phone":[]}') as unknown;
  const faq = JSON.parse(fields.faq ?? '[]') as unknown;
  const tags = JSON.parse(fields.tags ?? '[]') as unknown;
  return gameContentSchema.parse({
    title: fields.title ?? '',
    summary: fields.summary ?? '',
    status: fields.status ?? 'draft',
    author: fields.author ?? '',
    playedOn: fields.playedOn ?? '',
    updated: fields.updated ?? '',
    controls,
    faq,
    tags,
    sections: sectionHeadings(source),
  });
}

export function readGameContent(slug: string): GameContent | null {
  if (!hasContent('games', slug)) return null;
  return parseGameContent(readFileSync(contentPath('games', slug), 'utf8'));
}

/** Feed facts only. Never uses the publisher description. */
export function draftSummary(game: Pick<GameRecord, 'title' | 'hub' | 'orientation'>): string {
  const screen =
    game.orientation === 'landscape' ? 'a wide screen' : 'a phone held upright';
  const text = `${game.title} is a ${HUB_NAMES[game.hub]} game on PlayHubPlace. You play it free in the browser on ${screen}, with no download and no account.`;
  if (text.length > 160) {
    throw new Error(`Draft summary for ${game.title} is ${text.length} characters`);
  }
  if (text.length >= 140) return text;
  const padded = `${text} Press Play to start.`;
  if (padded.length < 140 || padded.length > 160) {
    throw new Error(`Draft summary for ${game.title} is ${padded.length} characters`);
  }
  return padded;
}
