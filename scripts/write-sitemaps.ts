import { rmSync, writeFileSync } from 'node:fs';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { absoluteFileUrl } from '@/lib/seo';
import { SITEMAP_CHILDREN, populatedSitemaps, sitemapIndexXml, sitemapSets, urlsetXml } from '@/lib/sitemaps';

const sets = sitemapSets(loadCurated(), buildToday());
const populated = populatedSitemaps(sets);
const written = new Set(populated.map((entry) => entry.child.file));
for (const child of SITEMAP_CHILDREN) {
  if (!written.has(child.file)) rmSync(child.file, { force: true });
}
for (const entry of populated) {
  writeFileSync(entry.child.file, urlsetXml(entry.urls));
}
writeFileSync(
  'public/sitemap.xml',
  sitemapIndexXml(populated.map((entry) => absoluteFileUrl(entry.child.path))),
);
console.log(
  `sitemaps pages=${sets.pages.length} categories=${sets.categories.length} games=${sets.games.length}`,
);
