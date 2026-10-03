import { describe, expect, it } from 'vitest';
import { listingMeta } from '@/lib/listing-meta';
import { fitTitle, gameTitle, hubTitle, ogCover } from '@/lib/seo';

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

describe('share image', () => {
  it('uses the cover only at 600 px and up', () => {
    expect(ogCover('https://img.gamepix.com/a.png', 599)).toBe('/og-default.png');
    expect(ogCover('https://img.gamepix.com/a.png', null)).toBe('/og-default.png');
    expect(ogCover('https://img.gamepix.com/a.png', 800)).toContain('w=800');
    expect(ogCover('https://img.gamepix.com/a.png', 2000)).toContain('w=1200');
  });
});
