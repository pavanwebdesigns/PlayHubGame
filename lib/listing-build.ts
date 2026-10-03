import type { GameRecord } from '@/lib/catalog/types';
import {
  pageCount,
  parseListing,
  rawTags,
  sortGames,
  type ListingQuery,
  type ListingSort,
} from '@/lib/listing';

export function listingGames(
  games: readonly GameRecord[],
  query: ListingQuery,
): GameRecord[] {
  const tagged = query.tag
    ? games.filter((game) => game.rawCategory === query.tag)
    : games;
  return sortGames(tagged, query.sort);
}

function pageRests(total: number, prefix: string[]): string[][] {
  const rests: string[][] = [];
  const pages = pageCount(total);
  if (prefix.length > 0) rests.push(prefix);
  for (let page = 2; page <= pages; page += 1) {
    rests.push([...prefix, 'page', String(page)]);
  }
  return rests;
}

export function listingRests(
  games: readonly GameRecord[],
  options: { defaultSort: ListingSort; tags: boolean },
): string[][] {
  const rests: string[][] = [[]];
  const other: ListingSort = options.defaultSort === 'popular' ? 'new' : 'popular';
  rests.push(...pageRests(games.length, []));
  rests.push(...pageRests(games.length, [other]));
  if (!options.tags) return rests;
  for (const tag of rawTags(games)) {
    const tagged = games.filter((game) => game.rawCategory === tag);
    rests.push(...pageRests(tagged.length, ['tag', tag]));
    rests.push(...pageRests(tagged.length, ['tag', tag, other]));
  }
  return rests;
}

export function parsedListing(
  rest: string[] | undefined,
  defaultSort: ListingSort,
): ListingQuery | null {
  return parseListing(rest, defaultSort);
}
