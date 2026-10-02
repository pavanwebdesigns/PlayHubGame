import { existsSync } from 'node:fs';

const SLUG = /^[a-z0-9-]+$/;

export function hasContent(
  kind: 'games' | 'hubs' | 'collections',
  slug: string,
): boolean {
  if (!SLUG.test(slug)) return false;
  return existsSync(`content/${kind}/${slug}.mdx`);
}
