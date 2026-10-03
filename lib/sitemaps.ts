import { visibleCollections } from '@/config/collections';
import { HUB_SLUGS } from '@/config/taxonomy';
import { contentUpdated, isIndexable } from '@/lib/content-gate';
import type { GameRecord } from '@/lib/catalog/types';
import { absoluteUrl } from '@/lib/seo';

export type SitemapUrl = { loc: string; lastmod: string | null };

function later(a: string | null, b: string | null): string | null {
  const dates = [a, b].filter((value): value is string => Boolean(value));
  if (dates.length === 0) return null;
  return dates.sort()[dates.length - 1]?.slice(0, 10) ?? null;
}

export function sitemapSets(
  games: readonly GameRecord[],
  now: Date,
): { pages: SitemapUrl[]; categories: SitemapUrl[]; games: SitemapUrl[] } {
  const pages: SitemapUrl[] = [
    { loc: absoluteUrl('/'), lastmod: contentUpdated('pages', 'home') },
    { loc: absoluteUrl('/new/'), lastmod: null },
    { loc: absoluteUrl('/about/'), lastmod: null },
    { loc: absoluteUrl('/contact/'), lastmod: null },
    { loc: absoluteUrl('/privacy/'), lastmod: null },
    { loc: absoluteUrl('/cookies/'), lastmod: null },
    { loc: absoluteUrl('/terms/'), lastmod: null },
  ];
  for (const slug of ['reaction-time-test', 'cps-test'] as const) {
    if (isIndexable('originals', slug)) {
      pages.push({
        loc: absoluteUrl(`/originals/${slug}/`),
        lastmod: contentUpdated('originals', slug),
      });
    }
  }

  const categories: SitemapUrl[] = [];
  for (const hub of HUB_SLUGS) {
    const count = games.filter((game) => game.hub === hub).length;
    if (count > 0 && isIndexable('categories', hub)) {
      categories.push({
        loc: absoluteUrl(`/category/${hub}/`),
        lastmod: contentUpdated('categories', hub),
      });
    }
  }
  for (const collection of visibleCollections(games, now)) {
    if (isIndexable('collections', collection.slug)) {
      categories.push({
        loc: absoluteUrl(`/collection/${collection.slug}/`),
        lastmod: contentUpdated('collections', collection.slug),
      });
    }
  }

  const gameUrls: SitemapUrl[] = [];
  for (const game of games) {
    if (!isIndexable('games', game.slug)) continue;
    gameUrls.push({
      loc: absoluteUrl(`/game/${game.slug}/`),
      lastmod: later(contentUpdated('games', game.slug), game.updatedAt),
    });
  }

  return { pages, categories, games: gameUrls };
}

export function urlsetXml(urls: readonly SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const lastmod = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : '';
      return `  <url><loc>${url.loc}</loc>${lastmod}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function sitemapIndexXml(locs: readonly string[]): string {
  const body = locs
    .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
