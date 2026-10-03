import { describe, expect, it } from 'vitest';
import type { GameRecord } from '@/lib/catalog/types';
import { listingMeta } from '@/lib/listing-meta';
import { organizationLd } from '@/lib/structured-data';
import { absoluteFileUrl, fitTitle, gameTitle, hubTitle, ogCover } from '@/lib/seo';
import { isIndexable } from '@/lib/content-gate';
import { loadContent } from '@/lib/content';
import { homeIsDraft } from '@/lib/launch-gate';
import { isScaffoldSummary, parseGameContent, realGameSummary } from '@/lib/game-content';
import { sitemapIndexXml, sitemapSets } from '@/lib/sitemaps';

describe('titles', () => {
  it('keeps the home and hub patterns inside 60 characters', () => {
    expect(hubTitle('Puzzle').length).toBeLessThanOrEqual(60);
    expect(hubTitle('Skill & Hyper-casual').length).toBeLessThanOrEqual(60);
    expect(gameTitle('Prism Match 3D')).toBe(
      'Prism Match 3D – Play Free Online | PlayHubPlace',
    );
    expect(fitTitle('x'.repeat(80)).length).toBeLessThanOrEqual(60);
  });
});

describe('listing urls', () => {
  const base = {
    name: 'Puzzle',
    summary: 'Free puzzle games in your browser.',
    pages: 4,
    base: '/category/puzzle',
    defaultSort: 'popular' as const,
    indexable: true,
    kind: 'hub' as const,
  };

  it('keeps later pages indexable and self-canonical', () => {
    const meta = listingMeta({
      ...base,
      query: { sort: 'popular', page: 2 },
    });
    expect(meta.index).toBe(true);
    expect(meta.path).toBe('/category/puzzle/page/2/');
    expect(meta.title).toContain('Page 2');
    expect(meta.description).toContain('Page 2 of 4.');
  });

  it('points a sort variant at the default first page', () => {
    const meta = listingMeta({
      ...base,
      query: { sort: 'new', page: 1 },
    });
    expect(meta.index).toBe(true);
    expect(meta.path).toBe('/category/puzzle/');
  });

  it('noindexes a tag page on its own url', () => {
    const meta = listingMeta({
      ...base,
      query: { sort: 'popular', page: 1, tag: 'physics' },
    });
    expect(meta.index).toBe(false);
    expect(meta.path).toBe('/category/puzzle/tag/physics/');
  });

  it('does not canonical a noindex hub sort page somewhere else', () => {
    const meta = listingMeta({
      ...base,
      indexable: false,
      query: { sort: 'new', page: 2 },
    });
    expect(meta.index).toBe(false);
    expect(meta.path).toBe('/category/puzzle/new/page/2/');
  });
});

describe('sitemaps', () => {
  const game = {
    id: '1',
    slug: 'prism-match-3d',
    title: 'Prism Match 3D',
    publisherDescription: '',
    rawCategory: 'match-3',
    hub: 'match-3',
    tags: ['match-3'],
    orientation: 'landscape',
    quality: 0.9,
    publishedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
    aspect: 1.6,
    coverWidth: 800,
    cover: 'https://img.gamepix.com/a.png',
    icon: 'https://img.gamepix.com/i.png',
    embedUrl: 'https://play.gamepix.com/x?sid=LC991',
  } satisfies GameRecord;

  it('keeps /new/ noindex until its page is published', () => {
    const summary = loadContent('pages', 'new')?.summary ?? '';
    expect(summary.length).toBeGreaterThanOrEqual(140);
    expect(summary.length).toBeLessThanOrEqual(160);
    expect(isIndexable('pages', 'new')).toBe(false);
  });

  it('keeps draft games and paginated urls out', () => {
    const sets = sitemapSets([game], new Date('2026-10-03T00:00:00.000Z'));
    expect(sets.games).toEqual([]);
    expect(sets.pages.map((item) => item.loc).join('\n')).not.toContain('/new/');
    expect(JSON.stringify(sets)).not.toContain('/page/');
    expect(JSON.stringify(sets)).not.toContain('/search/');
  });

  it('points the index at the xml files, without a trailing slash', () => {
    const xml = sitemapIndexXml([absoluteFileUrl('/sitemap-pages.xml')]);
    expect(xml).toContain('https://playhubplace.com/sitemap-pages.xml</loc>');
    expect(xml).not.toContain('sitemap-pages.xml/');
  });

  it('points the organization logo at the square file', () => {
    expect(organizationLd().logo).toBe('https://playhubplace.com/logo.png');
  });
});

describe('game summaries', () => {
  const scaffold =
    'Prism Match 3D is a Match-3 game on PlayHubPlace. You play it free in the browser on a phone held upright, with no download and no account. Press Play to start.';

  it('treats an empty scaffold summary as missing', () => {
    const doc = parseGameContent(`---
title: Prism Match 3D
# TODO(Pavan) write a 140-160 character summary after you play
summary: ""
status: draft
author: ""
playedOn: ""
updated: 2026-10-03
tags: []
controls: {"desktop":[],"phone":[]}
faq: []
---

## About
`);
    expect(doc.summary).toBe('');
    expect(realGameSummary(doc.summary)).toBeNull();
    expect(isScaffoldSummary(scaffold)).toBe(true);
    expect(realGameSummary(scaffold)).toBeNull();
  });

  it('rejects a published scaffold sentence', () => {
    expect(() =>
      parseGameContent(`---
title: Prism Match 3D
summary: ${scaffold}
status: published
author: Pavan
playedOn: 2026-10-03
updated: 2026-10-03
tags: []
controls: {"desktop":[{"key":"Tap","action":"Match"}],"phone":[{"gesture":"Tap","action":"Match"}]}
faq: [{"q":"Is it free?","a":"Yes."},{"q":"Do I download it?","a":"No."}]
---

## About

You match tiles.

## How to play

Tap a group.

## Tips

Start at the bottom.

## Who it's for

Players who like puzzles.
`),
    ).toThrow(/scaffold summary/);
  });
});

describe('launch gate', () => {
  it('treats the current home page as published', () => {
    expect(homeIsDraft()).toBe(false);
  });
});

describe('share image', () => {
  it('uses the cover only at 600 px and up', () => {
    expect(ogCover('https://img.gamepix.com/a.png', 599)).toBe('/og-default.png');
    expect(ogCover('https://img.gamepix.com/a.png', null)).toBe('/og-default.png');
    expect(ogCover('https://img.gamepix.com/a.png', 800)).toContain('w=800');
    expect(ogCover('https://img.gamepix.com/a.png', 2000)).toContain('w=1200');
  });
});
