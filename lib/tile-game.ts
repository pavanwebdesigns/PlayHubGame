import type { HubSlug } from '@/config/taxonomy';
import type { GameRecord, Orientation } from '@/lib/catalog/types';

/** Fields a tile is allowed to render. The rest of a catalog row stays on the server. */
export type TileGame = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  coverWidth: number | null;
  hub: HubSlug;
  publishedAt: string;
  orientation: Orientation;
  aspect: number;
};

export function toTileGame(game: GameRecord): TileGame {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    cover: game.cover,
    coverWidth: game.coverWidth,
    hub: game.hub,
    publishedAt: game.publishedAt,
    orientation: game.orientation,
    aspect: game.aspect,
  };
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

export function isNewGame(publishedAt: string, now: Date): boolean {
  const published = Date.parse(publishedAt);
  if (Number.isNaN(published)) return false;
  const age = now.getTime() - published;
  return age >= 0 && age <= WEEK;
}
