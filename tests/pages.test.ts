import { describe, expect, it } from 'vitest';
import { dayOfYear, spotlightChoice, spotlightPitch } from '@/config/spotlight';
import { activeSeasonal, SEASONAL_WINDOWS, windowContains } from '@/config/seasonal';
import { parseContent, faqItems } from '@/lib/content';
import { isIndexable } from '@/lib/content-gate';
import { listingPath, parseListing } from '@/lib/listing';
import { mergeRecent, parseRecent, readRecentSnapshot, RECENT_MAX } from '@/lib/recent';
import { nextPhase, wantsImmersive } from '@/lib/player';
import { dateSeed, seededShuffle, PICKS_COUNT } from '@/lib/picks';
import { fullRowMdCount, TILE_COLUMNS } from '@/lib/tile-pack';

describe('spotlight', () => {
  it('rotates by day and skips a missing slug', () => {
    const available = new Set(['drop-planets', 'defend-the-castle']);
    expect(spotlightChoice(available, 1)).toEqual({
      slug: 'drop-planets',
      skipped: ['prism-match-3d'],
      lowRes: [],
    });
    expect(
      spotlightChoice(available, 1, new Set(['drop-planets'])),
    ).toEqual({
      slug: 'defend-the-castle',
      skipped: ['prism-match-3d'],
      lowRes: ['drop-planets'],
    });
    expect(spotlightPitch('prism-match-3d')).toBeNull();
    expect(spotlightPitch('gallery-sample')).toBe(
      'A one-line pitch from the spotlight config.',
    );
  });

  it('counts 2 Oct 2026 as day 275', () => {
    expect(dayOfYear(new Date(Date.UTC(2026, 9, 2)))).toBe(275);
  });
});

describe('seasonal windows', () => {
  it('includes the first and last day and wraps Christmas', () => {
    const halloween = SEASONAL_WINDOWS[0];
    if (!halloween) throw new Error('missing halloween window');
    expect(windowContains(halloween, 10, 15)).toBe(true);
    expect(windowContains(halloween, 10, 14)).toBe(false);
    expect(windowContains(halloween, 11, 1)).toBe(true);
    expect(windowContains(halloween, 11, 2)).toBe(false);
    const christmas = activeSeasonal(new Date('2026-12-15T12:00:00+05:30'));
    expect(christmas.map((item) => item.id)).toEqual(['christmas']);
    expect(activeSeasonal(new Date('2026-10-02T18:30:00Z'))).toEqual([]);
    expect(activeSeasonal(new Date('2027-01-02T12:00:00+05:30')).map((item) => item.id)).toEqual([
      'christmas',
    ]);
  });
});

describe('content gate', () => {
  it('keeps draft category copy out of the index', () => {
    expect(isIndexable('categories', 'puzzle')).toBe(false);
    expect(isIndexable('collections', 'one-thumb')).toBe(false);
    expect(isIndexable('pages', 'home')).toBe(false);
    const home = parseContent(
      `---\ntitle: About\nsummary: A short summary for the home page test file.\nstatus: draft\n---\n\nHello there.\n\n## FAQ\n\n### Are the games free?\n\nYes.\n`,
    );
    expect(faqItems(home)).toEqual([
      { question: 'Are the games free?', answer: 'Yes.' },
    ]);
  });
});

describe('listings and picks', () => {
  it('round-trips a category path', () => {
    const query = { sort: 'new' as const, page: 2, tag: 'physics' };
    const path = listingPath('/category/puzzle', query);
    expect(path).toBe('/category/puzzle/tag/physics/new/page/2/');
    expect(parseListing(['tag', 'physics', 'new', 'page', '2'])).toEqual(query);
  });

  it('fills every breakpoint for 24 picks', () => {
    expect(PICKS_COUNT).toBe(24);
    const md = PICKS_COUNT - 1;
    for (const columns of TILE_COLUMNS) {
      const shown = fullRowMdCount(columns, md);
      expect(shown).toBeGreaterThan(0);
      expect((4 + shown) % columns).toBe(0);
    }
    const seed = dateSeed(new Date(Date.UTC(2026, 9, 2)));
    expect(seededShuffle([1, 2, 3, 4], seed)).toEqual(
      seededShuffle([1, 2, 3, 4], seed),
    );
  });
});

describe('recently played', () => {
  it('keeps the newest 30 and ignores bad storage', () => {
    const many = Array.from({ length: 40 }, (_, index) => ({
      slug: `game-${index}`,
      at: '2026-10-02T00:00:00.000Z',
    }));
    const merged = mergeRecent(many, 'newest', '2026-10-03T00:00:00.000Z');
    expect(merged).toHaveLength(RECENT_MAX);
    expect(merged[0]?.slug).toBe('newest');
    expect(parseRecent('nope')).toEqual([]);
    expect(parseRecent(null)).toEqual([]);
  });

  it('returns nothing when storage throws', () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
    try {
      expect(readRecentSnapshot()).toBeNull();
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original,
      });
    }
  });
});

describe('player phases', () => {
  it('moves cover to loading to playing, and times out', () => {
    expect(nextPhase('cover', 'play')).toBe('loading');
    expect(nextPhase('loading', 'loaded')).toBe('playing');
    expect(nextPhase('loading', 'timeout')).toBe('error');
    expect(nextPhase('error', 'reload')).toBe('loading');
    expect(nextPhase('playing', 'play')).toBe('playing');
    expect(wantsImmersive(390, 0)).toBe(true);
    expect(wantsImmersive(1440, 0)).toBe(false);
    expect(wantsImmersive(1440, 1)).toBe(true);
  });
});
