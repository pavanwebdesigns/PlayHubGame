import { writeFileSync } from 'node:fs';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { absoluteUrl } from '@/lib/seo';
import { sitemapIndexXml, sitemapSets, urlsetXml } from '@/lib/sitemaps';

const sets = sitemapSets(loadCurated(), buildToday());
writeFileSync('public/sitemap-pages.xml', urlsetXml(sets.pages));
writeFileSync('public/sitemap-categories.xml', urlsetXml(sets.categories));
writeFileSync('public/sitemap-games.xml', urlsetXml(sets.games));
writeFileSync(
  'public/sitemap.xml',
  sitemapIndexXml([
    absoluteUrl('/sitemap-pages.xml'),
    absoluteUrl('/sitemap-categories.xml'),
    absoluteUrl('/sitemap-games.xml'),
  ]),
);
console.log(
  `sitemaps pages=${sets.pages.length} categories=${sets.categories.length} games=${sets.games.length}`,
);
