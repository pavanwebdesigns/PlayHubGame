import { existsSync, readFileSync } from 'node:fs';
import { readGameContent } from '@/lib/game-content';

/**
 * Category copy lives in content/categories/. A file counts for the sitemap
 * only when its frontmatter says status: published. Draft stays noindex.
 */
export type ContentKind =
  | 'games'
  | 'categories'
  | 'collections'
  | 'originals'
  | 'pages';

const SLUG = /^[a-z0-9-]+$/;

export function contentPath(kind: ContentKind, slug: string): string {
  return `content/${kind}/${slug}.mdx`;
}

export function hasContent(kind: ContentKind, slug: string): boolean {
  if (!SLUG.test(slug)) return false;
  return existsSync(contentPath(kind, slug));
}

export function contentStatus(
  kind: ContentKind,
  slug: string,
): 'missing' | 'draft' | 'published' {
  if (!hasContent(kind, slug)) return 'missing';
  const source = readFileSync(contentPath(kind, slug), 'utf8');
  const match = source.match(/^status:\s*(draft|published)\s*$/m);
  return match?.[1] === 'published' ? 'published' : 'draft';
}

export function isIndexable(kind: ContentKind, slug: string): boolean {
  if (contentStatus(kind, slug) !== 'published') return false;
  if (kind !== 'games') return true;
  return readGameContent(slug)?.status === 'published';
}

export function contentUpdated(kind: ContentKind, slug: string): string | null {
  if (!hasContent(kind, slug)) return null;
  const source = readFileSync(contentPath(kind, slug), 'utf8');
  const match = source.match(/^updated:\s*(\d{4}-\d{2}-\d{2})/m);
  return match?.[1] ?? null;
}
