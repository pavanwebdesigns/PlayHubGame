import { readdirSync } from 'node:fs';
import { contentStatus, type ContentKind } from '@/lib/content-gate';

const KINDS: readonly ContentKind[] = [
  'games',
  'categories',
  'collections',
  'originals',
  'pages',
];

export function draftPages(): string[] {
  const drafts: string[] = [];
  for (const kind of KINDS) {
    let names: string[] = [];
    try {
      names = readdirSync(`content/${kind}`);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith('.mdx')) continue;
      const slug = name.slice(0, -4);
      if (kind === 'pages' && slug === 'home') continue;
      if (contentStatus(kind, slug) === 'draft') drafts.push(`content/${kind}/${name}`);
    }
  }
  return drafts.sort();
}

export function homeIsDraft(): boolean {
  return contentStatus('pages', 'home') !== 'published';
}
