import { TILE_SIZES, XL_SIZES } from '@/lib/cover-sizes';
import { tileHiddenClasses } from '@/lib/tile-pack';
import type { TileGame } from '@/lib/tile-game';

const THUMB_HIDE = new Set(['hide-cols-2', 'hide-cols-3']);
const WIDE_HIDE = new Set(['hide-cols-4', 'hide-cols-6', 'hide-cols-8']);

const PHONE_XL =
  '(max-width: 480px) calc(100vw - 2rem), (max-width: 768px) calc((100vw - 4rem) / 1.5 + 1rem)';
const PHONE_MD =
  '(max-width: 480px) calc((100vw - 3rem) / 2), (max-width: 768px) calc((100vw - 4rem) / 3)';
const DESK_XL = '(max-width: 1024px) calc((100vw - 5rem) / 2 + 1rem), 23rem';
const DESK_MD = '(max-width: 1024px) calc((100vw - 5rem) / 4), 11rem';

export type PickSize = 'xl' | 'md';

export type PackedPick = {
  game: TileGame;
  size: PickSize;
  hidden: string;
  order: number;
};

export type MergedPick = {
  game: TileGame;
  thumb: PackedPick | null;
  wide: PackedPick | null;
};

function keepHidden(hidden: string, allow: Set<string>): string {
  return hidden
    .split(' ')
    .filter((token) => allow.has(token))
    .join(' ');
}

/** One tile per game. Phone and desktop keep their own order, size, and packing. */
export function mergePickTiles(thumb: readonly PackedPick[], wide: readonly PackedPick[]): MergedPick[] {
  const wideBySlug = new Map(wide.map((tile) => [tile.game.slug, tile]));
  const seen = new Set<string>();
  const merged: MergedPick[] = [];

  for (const tile of thumb) {
    seen.add(tile.game.slug);
    const wideTile = wideBySlug.get(tile.game.slug);
    merged.push({
      game: tile.game,
      thumb: { ...tile, hidden: keepHidden(tile.hidden, THUMB_HIDE) },
      wide: wideTile ? { ...wideTile, hidden: keepHidden(wideTile.hidden, WIDE_HIDE) } : null,
    });
  }

  for (const tile of wide) {
    if (seen.has(tile.game.slug)) continue;
    merged.push({
      game: tile.game,
      thumb: null,
      wide: { ...tile, hidden: keepHidden(tile.hidden, WIDE_HIDE) },
    });
  }

  return merged;
}

export function packPickTiles(
  tiles: readonly { game: TileGame; size: PickSize }[],
): PackedPick[] {
  const hidden = tileHiddenClasses(tiles);
  return tiles.map((tile, order) => ({
    game: tile.game,
    size: tile.size,
    hidden: hidden[order] ?? '',
    order,
  }));
}

export function pickClassName(pick: MergedPick): string {
  return [
    'pick-slot',
    pick.thumb ? 'pick-thumb' : '',
    pick.wide ? 'pick-wide' : '',
    pick.thumb?.size === 'xl' ? 'pick-xl-thumb' : '',
    pick.wide?.size === 'xl' ? 'pick-xl-wide' : '',
    pick.thumb?.hidden ?? '',
    pick.wide?.hidden ?? '',
  ]
    .filter((token) => token.length > 0)
    .join(' ');
}

/** sizes follows the tile that is actually on screen at that width. */
export function pickCoverSizes(thumb: PickSize | null, wide: PickSize | null): string {
  if (thumb === wide || thumb === null) return wide === 'xl' ? XL_SIZES : TILE_SIZES;
  if (wide === null) return thumb === 'xl' ? XL_SIZES : TILE_SIZES;
  const phone = thumb === 'xl' ? PHONE_XL : PHONE_MD;
  const desk = wide === 'xl' ? DESK_XL : DESK_MD;
  return `${phone}, ${desk}`;
}
