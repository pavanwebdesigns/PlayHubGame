import type { GameRecord } from '@/lib/catalog/types';

export const QUALITY_MIN = 0.7;
export const NEWEST_COUNT = 200;

/** Game ids forced into the curated set. Empty until Pavan adds one. */
export const ALLOWLIST: readonly string[] = [];

/**
 * Raw categories that are third-party brands. Games in these categories are
 * valid feed items, and they are left out of pages, search, and sitemaps.
 * tetris, bejeweled, and scrabble are extra brand categories found in the feed.
 */
export const DENY_CATEGORIES = [
  'mario',
  'minecraft',
  'skibidi-toilet',
  'ninja-turtle',
  'granny',
  'tetris',
  'bejeweled',
  'scrabble',
] as const;

const DENY_TITLE =
  /\b(mario|minecraft|skibidi(?:[\s-]?toilets?)?|ninja[\s-]?turtles?|granny|tetris|bejeweled|scrabble)\b/i;

export function isDenied(
  game: Pick<GameRecord, 'title' | 'rawCategory'>,
): boolean {
  if ((DENY_CATEGORIES as readonly string[]).includes(game.rawCategory))
    return true;
  return DENY_TITLE.test(game.title);
}

export function curate(
  games: readonly GameRecord[],
  allowlist: readonly string[] = ALLOWLIST,
): GameRecord[] {
  const newestIds = new Set(
    [...games]
      .sort((a, b) => {
        if (a.publishedAt !== b.publishedAt)
          return a.publishedAt < b.publishedAt ? 1 : -1;
        return a.id < b.id ? -1 : 1;
      })
      .slice(0, NEWEST_COUNT)
      .map((game) => game.id),
  );
  const allowed = new Set(allowlist);

  return games
    .filter((game) => {
      if (isDenied(game)) return false;
      return (
        game.quality >= QUALITY_MIN ||
        newestIds.has(game.id) ||
        allowed.has(game.id)
      );
    })
    .sort((a, b) => {
      if (a.quality !== b.quality) return b.quality - a.quality;
      return a.slug < b.slug ? -1 : 1;
    });
}
