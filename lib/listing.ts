import { DENY_CATEGORIES } from '@/config/curation';
import type { GameRecord } from '@/lib/catalog/types';
import { rankByQuality } from '@/lib/picks';

export const LISTING_PAGE_SIZE = 48;

export type ListingSort = 'popular' | 'new';

export type ListingQuery = {
  sort: ListingSort;
  page: number;
  tag?: string;
};

const denied = new Set<string>(DENY_CATEGORIES);

export function tagLabel(raw: string): string {
  const text = raw.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sortGames(
  games: readonly GameRecord[],
  sort: ListingSort,
): GameRecord[] {
  if (sort === 'popular') return rankByQuality(games);
  return [...games].sort((a, b) => {
    if (a.publishedAt !== b.publishedAt) return a.publishedAt < b.publishedAt ? 1 : -1;
    return a.slug < b.slug ? -1 : 1;
  });
}

export function listingPath(
  base: string,
  query: ListingQuery,
  defaultSort: ListingSort = 'popular',
): string {
  const parts = [base.replace(/\/$/, '')];
  if (query.tag) parts.push('tag', query.tag);
  if (query.sort !== defaultSort) parts.push(query.sort);
  if (query.page > 1) parts.push('page', String(query.page));
  return `${parts.join('/')}/`;
}

export function parseListing(
  rest: readonly string[] | undefined,
  defaultSort: ListingSort = 'popular',
): ListingQuery | null {
  const parts = [...(rest ?? [])];
  let sort = defaultSort;
  let tag: string | undefined;
  let page = 1;

  if (parts[0] === 'tag') {
    const raw = parts[1];
    if (!raw || !/^[a-z0-9-]+$/.test(raw) || denied.has(raw)) return null;
    tag = raw;
    parts.splice(0, 2);
  }

  if (parts[0] === 'popular' || parts[0] === 'new') {
    sort = parts[0];
    parts.shift();
  }

  if (parts[0] === 'page') {
    const value = Number(parts[1]);
    if (!Number.isInteger(value) || value < 2 || parts.length !== 2) return null;
    page = value;
    parts.splice(0, 2);
  }

  if (parts.length > 0) return null;
  return { sort, page, tag };
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE));
}

export function pageSlice<T>(items: readonly T[], page: number): T[] {
  const start = (page - 1) * LISTING_PAGE_SIZE;
  return items.slice(start, start + LISTING_PAGE_SIZE);
}

export function rawTags(games: readonly GameRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    if (denied.has(game.rawCategory)) continue;
    counts.set(game.rawCategory, (counts.get(game.rawCategory) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([tag]) => tag);
}
