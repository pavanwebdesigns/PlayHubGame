import { describe, expect, it } from 'vitest';
import { spotlightPitch } from '@/config/spotlight';
import { coverAspect } from '@/lib/cover-aspect';
import { isSearchShortcutBlocked } from '@/lib/search-shortcut';
import { isFavoriteSlug } from '@/lib/favorites';
import { isNewGame, toTileGame } from '@/lib/tile-game';
import { featuredSideCells, mdCountForPackedGrid } from '@/lib/tile-pack';
import type { GameRecord } from '@/lib/catalog/types';

const record: GameRecord = {
  id: '737HCH',
  slug: 'prism-match-3d',
  title: 'Prism Match 3D',
  publisherDescription:
    'A long feed description that must never reach a tile or a spotlight pitch.'.repeat(
      8,
    ),
  rawCategory: 'match-3',
  hub: 'match-3',
  tags: ['match-3'],
  orientation: 'landscape',
  quality: 0.9,
  publishedAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  aspect: 1.6,
  cover: 'https://img.gamepix.com/cover.jpg',
  icon: 'https://img.gamepix.com/icon.jpg',
  embedUrl: 'https://play.gamepix.com/game?sid=LC991',
};

describe('tile payload', () => {
  it('keeps the home-bound fields and drops the feed text', () => {
    const tile = toTileGame(record);
    expect(Object.keys(tile).sort()).toEqual(
      [
        'aspect',
        'cover',
        'hub',
        'orientation',
        'publishedAt',
        'slug',
        'title',
      ].sort(),
    );
    const full = JSON.stringify(record).length;
    const slim = JSON.stringify(tile).length;
    expect(slim).toBeLessThan(full / 2);
    expect(JSON.stringify(tile)).not.toContain('publisherDescription');
    expect(JSON.stringify(tile)).not.toContain('sid=LC991');
  });
});

describe('spotlight pitch', () => {
  it('uses the config entry and renders nothing when a game has no pitch', () => {
    expect(spotlightPitch('gallery-sample')).toBe(
      'A one-line pitch from the spotlight config.',
    );
    expect(spotlightPitch('prism-match-3d')).toBeNull();
    expect(spotlightPitch('gallery-sample')).not.toContain(
      record.publisherDescription,
    );
  });
});

describe('search shortcut', () => {
  it('ignores typing targets and the game frame', () => {
    expect(isSearchShortcutBlocked(null)).toBe(false);
    expect(isSearchShortcutBlocked({ tagName: 'BODY' })).toBe(false);
    expect(isSearchShortcutBlocked({ tagName: 'INPUT' })).toBe(true);
    expect(isSearchShortcutBlocked({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isSearchShortcutBlocked({ isContentEditable: true })).toBe(true);
    expect(isSearchShortcutBlocked({ inGameFrame: true })).toBe(true);
  });
});

describe('favorite mark', () => {
  it('matches the legacy favorites key by slug', () => {
    const raw = JSON.stringify([
      { id: '737HCH', title: 'Prism Match 3D', namespace: 'prism-match-3d' },
    ]);
    expect(isFavoriteSlug(raw, 'prism-match-3d')).toBe(true);
    expect(isFavoriteSlug(raw, 'other')).toBe(false);
    expect(isFavoriteSlug(null, 'prism-match-3d')).toBe(false);
  });
});

describe('cover aspect', () => {
  it('uses the measured median from the catalog', () => {
    expect(coverAspect()).toBe(1.6);
  });
});

describe('tile grid packing', () => {
  it('fills the cells beside a large tile at every column count', () => {
    for (const columns of [2, 3, 4, 6, 8]) {
      const md = mdCountForPackedGrid(columns, 7);
      expect(md).toBeGreaterThanOrEqual(featuredSideCells(columns));
      expect(featuredSideCells(columns) - md).toBeLessThanOrEqual(0);
    }
    expect(mdCountForPackedGrid(4, 7)).toBe(7);
    expect(mdCountForPackedGrid(6, 7)).toBe(8);
    expect(mdCountForPackedGrid(8, 7)).toBe(12);
  });
});

describe('new badge', () => {
  it('is limited to the last seven days', () => {
    const now = new Date('2026-10-02T00:00:00.000Z');
    expect(isNewGame('2026-10-01T00:00:00.000Z', now)).toBe(true);
    expect(isNewGame('2026-01-01T00:00:00.000Z', now)).toBe(false);
  });
});
