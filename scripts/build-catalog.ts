import { mkdirSync, writeFileSync } from 'node:fs';
import { feedStartUrl } from '@/config/site';
import { writePublicTiles } from './write-tiles';
import { measureCoverSample } from '@/lib/catalog/covers';
import { fetchFeed } from '@/lib/catalog/fetch-feed';
import { buildCatalog } from '@/lib/catalog/run';
import { readFirstSnapshot, snapshotSearchDirs } from '@/lib/catalog/snapshot';

/**
 * Last-good catalog restore:
 * 1. CATALOG_CACHE_DIR — GitHub Actions cache mount
 * 2. CATALOG_SNAPSHOT_DIR — checkout of the catalog-snapshot branch
 * Task 1.7 commits catalog.json and meta.json to that branch after a good build.
 */
const outputs = await buildCatalog({
  fetchFeed: () => fetchFeed({ startUrl: feedStartUrl() }),
  loadSnapshot: () => readFirstSnapshot(snapshotSearchDirs()),
  measureCovers: (games) => measureCoverSample(games),
});

mkdirSync('data', { recursive: true });
mkdirSync('public/data', { recursive: true });

writeFileSync('data/catalog.json', `${JSON.stringify(outputs.catalog)}\n`);
writeFileSync('data/curated.json', `${JSON.stringify(outputs.curated)}\n`);
writeFileSync(
  'data/search-index.json',
  `${JSON.stringify(outputs.searchIndex)}\n`,
);
writeFileSync('data/meta.json', `${JSON.stringify(outputs.meta, null, 2)}\n`);
writeFileSync(
  'public/data/legacy-ids.json',
  `${JSON.stringify(outputs.legacyIds)}\n`,
);
writeFileSync(
  'public/data/search-index.json',
  `${JSON.stringify(outputs.searchIndex)}\n`,
);
writePublicTiles(outputs.curated);

const hubs = Object.entries(outputs.meta.hubCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([hub, count]) => `${hub}=${count}`)
  .join(', ');

console.log(
  [
    `valid=${outputs.meta.validCount}`,
    `invalid=${outputs.meta.invalidCount}`,
    `curated=${outputs.meta.curatedCount}`,
    `pages=${outputs.meta.pagesFetched}`,
    `stale=${outputs.meta.stale}`,
    `coverMedian=${outputs.meta.coverSample.medianAspect}`,
    `coverMeasured=${outputs.meta.coverSample.measured}/${outputs.meta.coverSample.requested}`,
    `feedModified=${outputs.meta.feedModified ?? 'unknown'}`,
  ].join(' '),
);
console.log(hubs);
const collections = Object.entries(outputs.meta.collectionCounts)
  .map(([slug, row]) => `${slug}=${row.count}${row.visible ? '' : ' (hidden)'}`)
  .join(', ');
console.log(collections);
