import type { GameRecord } from '@/lib/catalog/types';
import { rankByQuality } from '@/lib/picks';

export function similarGames(
  games: readonly GameRecord[],
  slug: string,
  hub: string,
  count: number,
): GameRecord[] {
  return rankByQuality(
    games.filter((game) => game.hub === hub && game.slug !== slug),
  ).slice(0, count);
}
