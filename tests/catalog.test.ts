import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COLLECTIONS, visibleCollections } from '@/config/collections';
import { curate, isDenied } from '@/config/curation';
import { HUB_NAMES, RAW_CATEGORY_TO_HUB, hubFor } from '@/config/taxonomy';
import { catalogWithinThresholds, invalidRatio } from '@/lib/catalog/assess';
import { coverWidthWarning } from '@/lib/catalog/cover-widths';
import { imageSize } from '@/lib/catalog/image-size';
import { probeImageUrl } from '@/lib/catalog/probe-image';
import { requestedCoverWidth } from '@/lib/catalog/urls';
import { normalizeFeedItems } from '@/lib/catalog/normalize';
import { CatalogError, buildCatalog } from '@/lib/catalog/run';
import { gamePixItemSchema } from '@/lib/catalog/schema';
import { assignUniqueSlugs } from '@/lib/catalog/slugs';
import type { GameRecord } from '@/lib/catalog/types';
import { embedUrlWithSid, stripQuery } from '@/lib/catalog/urls';
import sampleItem from './fixtures/gamepix-item.json';

const emptyCover = {
  requested: 0,
  measured: 0,
  medianAspect: 1,
  aspects: [] as number[],
};

function game(overrides: Partial<GameRecord> = {}): GameRecord {
  return {
    id: '1',
    slug: 'sample',
    title: 'Sample',
    publisherDescription: '',
    rawCategory: 'puzzle',
    hub: 'puzzle',
    tags: ['puzzle'],
    orientation: 'landscape',
    quality: 0.8,
    publishedAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    aspect: 1.5,
    coverWidth: null,
    cover: 'https://img.gamepix.com/cover.png',
    icon: 'https://img.gamepix.com/icon.png',
    embedUrl: 'https://play.gamepix.com/sample/embed?sid=LC991',
    ...overrides,
  };
}

describe('feed schema', () => {
  it('accepts the real sample item', () => {
    expect(gamePixItemSchema.safeParse(sampleItem).success).toBe(true);
  });

  it('rejects a bad item', () => {
    const bad = { ...sampleItem, orientation: 'sideways' };
    expect(gamePixItemSchema.safeParse(bad).success).toBe(false);
  });
});

describe('slugs and embed urls', () => {
  it('keeps the lowest id on a collision and suffixes the rest', () => {
    const slugged = assignUniqueSlugs([
      { id: 'b', slug: 'drop' },
      { id: 'a', slug: 'drop' },
      { id: 'c', slug: 'drop-2' },
    ]);
    const byId = Object.fromEntries(
      slugged.map((item) => [item.id, item.slug]),
    );
    expect(byId.a).toBe('drop');
    expect(byId.c).toBe('drop-2');
    expect(byId.b).toBe('drop-3');
  });

  it('puts sid in a single query string', () => {
    const url = embedUrlWithSid(
      'https://play.gamepix.com/x/embed?foo=1&sid=OTHER',
    );
    expect(url).not.toBeNull();
    expect(url?.split('?')).toHaveLength(2);
    expect(new URL(url ?? '').searchParams.get('sid')).toBe('LC991');
    expect(new URL(url ?? '').searchParams.get('foo')).toBe('1');
  });

  it('strips the cover query', () => {
    expect(stripQuery('https://img.gamepix.com/a.png?w=320')).toBe(
      'https://img.gamepix.com/a.png',
    );
  });
});

describe('taxonomy', () => {
  it('maps the 147 raw categories measured on 2 Oct 2026', () => {
    expect(Object.keys(RAW_CATEGORY_TO_HUB)).toHaveLength(147);
    for (const hub of Object.values(RAW_CATEGORY_TO_HUB)) {
      expect(HUB_NAMES[hub]).toBeTruthy();
    }
    expect(hubFor('not-a-category')).toBeUndefined();
  });
});

describe('curation', () => {
  it('keeps quality, the newest, and the allowlist, and drops brand games', () => {
    const fillers = Array.from({ length: 200 }, (_, index) =>
      game({
        id: `n${String(index).padStart(3, '0')}`,
        slug: `n${index}`,
        hub: 'casual',
        quality: 0.1,
        publishedAt: '2026-10-01T00:00:00.000Z',
      }),
    );
    const floor = Array.from({ length: 40 }, (_, index) =>
      game({
        id: `f${String(index).padStart(2, '0')}`,
        slug: `f${index}`,
        hub: 'action',
        quality: 0.5,
        publishedAt: '2015-01-01T00:00:00.000Z',
      }),
    );
    const older = game({
      id: 'old',
      slug: 'old',
      hub: 'action',
      quality: 0.2,
      publishedAt: '2019-01-01T00:00:00.000Z',
    });
    const allowed = game({
      id: 'allow',
      slug: 'allow',
      quality: 0.1,
      publishedAt: '2018-01-01T00:00:00.000Z',
    });
    const strong = game({
      id: 'strong',
      slug: 'strong',
      quality: 0.9,
      publishedAt: '2017-01-01T00:00:00.000Z',
    });
    const mario = game({
      id: 'brand',
      slug: 'brand',
      title: 'Super Mario Run',
      quality: 0.99,
    });
    const curated = curate(
      [...fillers, ...floor, older, allowed, strong, mario],
      ['allow'],
    );
    const ids = curated.map((item) => item.id);
    expect(ids).toContain('strong');
    expect(ids).toContain('n000');
    expect(ids).toContain('allow');
    expect(ids).not.toContain('old');
    expect(ids).not.toContain('brand');
    expect(isDenied(mario)).toBe(true);
    expect(
      isDenied(game({ title: 'Skibidi Laser Kill', rawCategory: 'action' })),
    ).toBe(true);
  });

  it('matches collection predicates', () => {
    const oneThumb = COLLECTIONS.find(
      (collection) => collection.slug === 'one-thumb',
    );
    const newest = COLLECTIONS.find(
      (collection) => collection.slug === 'new-this-week',
    );
    const portrait = game({ orientation: 'portrait' });
    const landscape = game({ orientation: 'landscape' });
    expect(oneThumb?.matches(portrait, new Date())).toBe(true);
    expect(oneThumb?.matches(landscape, new Date())).toBe(false);
    const recent = game({ publishedAt: '2026-10-01T00:00:00.000Z' });
    const old = game({ publishedAt: '2020-01-01T00:00:00.000Z' });
    const now = new Date('2026-10-02T00:00:00.000Z');
    expect(newest?.matches(recent, now)).toBe(true);
    expect(newest?.matches(old, now)).toBe(false);
  });

  it('keeps the top 40 in a hub and hides a short collection', () => {
    const newer = Array.from({ length: 200 }, (_, index) =>
      game({
        id: `q${String(index).padStart(3, '0')}`,
        slug: `q${index}`,
        hub: 'casual',
        quality: 0.1,
        publishedAt: '2026-09-01T00:00:00.000Z',
      }),
    );
    const low = Array.from({ length: 45 }, (_, index) =>
      game({
        id: `h${String(index).padStart(2, '0')}`,
        slug: `h${index}`,
        hub: 'seasonal',
        rawCategory: 'christmas',
        quality: index / 100,
        publishedAt: '2010-01-01T00:00:00.000Z',
      }),
    );
    const denied = game({
      id: 'denied',
      slug: 'denied',
      hub: 'seasonal',
      rawCategory: 'mario',
      title: 'Mario',
      quality: 1,
    });
    const curated = curate([...newer, ...low, denied]);
    const seasonal = curated.filter((item) => item.hub === 'seasonal');
    expect(seasonal).toHaveLength(40);
    expect(seasonal.some((item) => item.id === 'denied')).toBe(false);
    expect(seasonal.some((item) => item.id === 'h00')).toBe(false);
    const now = new Date('2026-10-02T00:00:00.000Z');
    const short = Array.from({ length: 23 }, (_, index) =>
      game({
        id: `p${index}`,
        slug: `p${index}`,
        orientation: 'portrait',
        rawCategory: 'puzzle',
      }),
    );
    expect(
      visibleCollections(short, now).map((item) => item.slug),
    ).not.toContain('one-thumb');
    expect(
      visibleCollections(
        Array.from({ length: 24 }, (_, index) =>
          game({
            id: `p${index}`,
            slug: `p${index}`,
            orientation: 'portrait',
            rawCategory: 'puzzle',
          }),
        ),
        now,
      ).map((item) => item.slug),
    ).toContain('one-thumb');
  });
});

describe('thresholds and restore', () => {
  it('fails a short or dirty catalog', () => {
    expect(catalogWithinThresholds(10_000, 100)).toBe(true);
    expect(catalogWithinThresholds(9_999, 0)).toBe(false);
    expect(invalidRatio(99, 2)).toBeGreaterThan(0.01);
    expect(catalogWithinThresholds(99, 2, 10, 0.01)).toBe(false);
  });

  it('marks the build stale when the feed throws and a snapshot exists', async () => {
    const snapshotGame = game({ id: 'kept', quality: 0.9 });
    const result = await buildCatalog({
      fetchFeed: async () => {
        throw new Error('HTTP 500');
      },
      loadSnapshot: () => ({
        catalog: Array.from({ length: 10_000 }, () => snapshotGame),
        meta: null,
      }),
      measureCovers: async () => emptyCover,
      now: new Date('2026-10-02T00:00:00.000Z'),
    });
    expect(result.meta.stale).toBe(true);
    expect(result.catalog).toHaveLength(10_000);
  });

  it('refuses an empty result when nothing can be restored', async () => {
    await expect(
      buildCatalog({
        fetchFeed: async () => {
          throw new Error('HTTP 500');
        },
        loadSnapshot: () => null,
        measureCovers: async () => emptyCover,
      }),
    ).rejects.toBeInstanceOf(CatalogError);
  });

  it('fails when a raw category is unmapped', async () => {
    const item = { ...sampleItem, category: 'brand-new-genre' };
    await expect(
      buildCatalog({
        fetchFeed: async () => ({
          items: [item],
          pagesFetched: 1,
          feedModified: null,
        }),
        loadSnapshot: () => ({ catalog: [game()], meta: null }),
        measureCovers: async () => emptyCover,
        withinThresholds: () => true,
      }),
    ).rejects.toThrow(/Unmapped categories: brand-new-genre/);
  });
});

describe('cover widths', () => {
  it('never requests a width above the source', () => {
    expect(requestedCoverWidth(640, 187)).toBe(187);
    expect(requestedCoverWidth(160, null)).toBe(160);
    expect(requestedCoverWidth(480, null)).toBe(160);
  });

  it('warns only when more than 5 percent of covers fail', () => {
    expect(coverWidthWarning(100, 5)).toBeNull();
    expect(coverWidthWarning(100, 6)).toMatch(/WARNING: 6 of 100/);
  });

  it('stops reading once the header has a size', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const fetchImpl: typeof fetch = async () =>
      new Response(png, { status: 200, headers: { 'content-type': 'image/png' } });
    await expect(probeImageUrl('https://img.gamepix.com/a.png', fetchImpl)).resolves.toEqual({
      width: 1,
      height: 1,
    });
  });

  it('does not keep a failed measurement', async () => {
    const fetchImpl: typeof fetch = async () => new Response(null, { status: 404 });
    await expect(probeImageUrl('https://img.gamepix.com/missing.png', fetchImpl)).resolves.toBeNull();
  });
});

describe('image size', () => {
  it('reads a png header', () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    expect(imageSize(png)).toEqual({ width: 1, height: 1 });
  });
});

describe('normalize', () => {
  it('accepts a game that has no publisher description', () => {
    const withoutDescription = Object.fromEntries(
      Object.entries(sampleItem).filter(([key]) => key !== 'description'),
    );
    const result = normalizeFeedItems([withoutDescription]);
    expect(result.invalidCount).toBe(0);
    expect(result.catalog[0]?.publisherDescription).toBe('');
  });

  it('turns the sample item into a record with one sid', () => {
    const result = normalizeFeedItems([sampleItem]);
    expect(result.invalidCount).toBe(0);
    expect(result.catalog[0]?.slug).toBe('prism-match-3d');
    expect(result.catalog[0]?.hub).toBe('match-3');
    expect(result.catalog[0]?.embedUrl).toContain('sid=LC991');
    expect(result.catalog[0]?.cover).not.toContain('?');
  });
});

describe('home page data', () => {
  it('does not import catalog data into the home page client graph', () => {
    const seen = new Set<string>();
    const visit = (file: string, fromClient: boolean) => {
      if (seen.has(file)) return;
      seen.add(file);
      const text = readFileSync(file, 'utf8');
      const isClient =
        fromClient ||
        text.includes("'use client'") ||
        text.includes('"use client"');
      if (isClient) {
        expect(text).not.toMatch(/data\/(catalog|curated|search-index|meta)/);
      }
      for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        const spec = match[1];
        if (!spec?.startsWith('@/') && !spec?.startsWith('.')) continue;
        const base = spec.startsWith('@/')
          ? `${process.cwd()}/${spec.slice(2)}`
          : `${file.slice(0, file.lastIndexOf('/'))}/${spec}`;
        const resolved = ['.tsx', '.ts']
          .map((ext) => `${base}${ext}`)
          .find((path) => {
            try {
              readFileSync(path);
              return true;
            } catch {
              return false;
            }
          });
        if (resolved) visit(resolved, isClient);
      }
    };
    visit(`${process.cwd()}/app/(site)/page.tsx`, false);
    visit(`${process.cwd()}/app/layout.tsx`, false);
  });
});
