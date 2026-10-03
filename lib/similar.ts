import type { GameRecord } from '@/lib/catalog/types';
import { rankByQuality } from '@/lib/picks';

export function similarGames(
  games: readonly GameRecord[],
  slug: string,
  hub: string,
  count: number,
  prefer: (slug: string) => boolean = () => false,
): GameRecord[] {
  const ranked = rankByQuality(
    games.filter((game) => game.hub === hub && game.slug !== slug),
  );
  return [...ranked.filter((game) => prefer(game.slug)), ...ranked.filter((game) => !prefer(game.slug))].slice(
    0,
    count,
  );
}
