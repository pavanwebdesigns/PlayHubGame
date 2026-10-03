import { describe, expect, it } from 'vitest';
import { mergePickTiles, packPickTiles, pickClassName, pickCoverSizes } from '@/lib/home-picks';
import { TILE_SIZES, XL_SIZES } from '@/lib/cover-sizes';
import type { TileGame } from '@/lib/tile-game';

function tile(slug: string): TileGame {
  return {
    id: slug,
    slug,
    title: slug,
    cover: 'https://img.gamepix.com/cover.jpg',
    coverWidth: 800,
    hub: 'puzzle',
    publishedAt: '2026-10-01T00:00:00.000Z',
    orientation: 'portrait',
    aspect: 0.7,
  };
}

describe('merged home picks', () => {
  const thumb = packPickTiles([
    { game: tile('phone-xl'), size: 'xl' },
    { game: tile('shared'), size: 'md' },
    { game: tile('phone-only'), size: 'md' },
  ]);
  const wide = packPickTiles([
    { game: tile('desk-xl'), size: 'xl' },
    { game: tile('shared'), size: 'md' },
    { game: tile('desk-only'), size: 'md' },
  ]);
  const merged = mergePickTiles(thumb, wide);

  it('keeps each game once and remembers both orders', () => {
    expect(merged.map((pick) => pick.game.slug)).toEqual([
      'phone-xl',
      'shared',
      'phone-only',
      'desk-xl',
      'desk-only',
    ]);
    const shared = merged.find((pick) => pick.game.slug === 'shared');
    expect(shared?.thumb?.order).toBe(1);
    expect(shared?.wide?.order).toBe(1);
    expect(pickClassName(shared!)).toContain('pick-thumb');
    expect(pickClassName(shared!)).toContain('pick-wide');
    expect(pickClassName(merged[3]!)).not.toContain('pick-thumb');
  });

  it('uses the on-screen size at each width', () => {
    expect(pickCoverSizes('xl', 'xl')).toBe(XL_SIZES);
    expect(pickCoverSizes('md', 'md')).toBe(TILE_SIZES);
    expect(pickCoverSizes('xl', 'md')).toContain('calc(100vw - 2rem)');
    expect(pickCoverSizes('xl', 'md')).toContain('11rem');
    expect(pickCoverSizes('md', 'xl')).toContain('23rem');
  });
});
