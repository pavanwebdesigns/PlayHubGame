import type { GameRecord } from '@/lib/catalog/types';

export const PICKS_COUNT = 24;
export const PICKS_POOL = 300;

export function dateSeed(date: Date): number {
  return (
    date.getUTCFullYear() * 10_000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = mulberry32(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    const other = copy[swap];
    if (current === undefined || other === undefined) continue;
    copy[index] = other;
    copy[swap] = current;
  }
  return copy;
}

function byQuality(a: GameRecord, b: GameRecord): number {
  if (a.quality !== b.quality) return b.quality - a.quality;
  return a.slug < b.slug ? -1 : 1;
}

/** Date-seeded slice of the top pool. The phone grid is portrait and all. */
export function todaysPicks(
  games: readonly GameRecord[],
  date: Date,
  oneThumb: boolean,
): GameRecord[] {
  const pool = games
    .filter(
      (game) =>
        !oneThumb ||
        game.orientation === 'portrait' ||
        game.orientation === 'all',
    )
    .sort(byQuality)
    .slice(0, PICKS_POOL);
  const seed = dateSeed(date) + (oneThumb ? 17 : 0);
  return seededShuffle(pool, seed).slice(0, PICKS_COUNT);
}

export function rankByQuality(games: readonly GameRecord[]): GameRecord[] {
  return [...games].sort(byQuality);
}
