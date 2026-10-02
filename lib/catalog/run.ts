import {
  COLLECTIONS,
  collectionSize,
  COLLECTION_MIN,
} from '@/config/collections';
import { curate } from '@/config/curation';
import { MAX_INVALID_RATIO, MIN_VALID_GAMES } from '@/config/site';
import { catalogWithinThresholds } from '@/lib/catalog/assess';
import { normalizeFeedItems } from '@/lib/catalog/normalize';
import type { CatalogSnapshot } from '@/lib/catalog/snapshot';
import type {
  CatalogMeta,
  CoverSample,
  GameRecord,
  SearchIndexEntry,
} from '@/lib/catalog/types';
import type { FeedFetchResult } from '@/lib/catalog/fetch-feed';

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogError';
  }
}

export type CatalogOutputs = {
  catalog: GameRecord[];
  curated: GameRecord[];
  searchIndex: SearchIndexEntry[];
  legacyIds: Record<string, string>;
  meta: CatalogMeta;
};

type BuildInput = {
  fetchFeed: () => Promise<FeedFetchResult>;
  loadSnapshot: () => CatalogSnapshot | null;
  measureCovers: (games: readonly GameRecord[]) => Promise<CoverSample>;
  now?: Date;
  withinThresholds?: (valid: number, invalid: number) => boolean;
};

function hubCounts(games: readonly GameRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const game of games) {
    counts[game.hub] = (counts[game.hub] ?? 0) + 1;
  }
  return counts;
}

function assemble(
  catalog: readonly GameRecord[],
  details: {
    validCount: number;
    invalidCount: number;
    pagesFetched: number;
    feedModified: string | null;
    stale: boolean;
    coverSample: CoverSample;
    now: Date;
  },
): CatalogOutputs {
  const curated = curate(catalog);
  const legacyIds: Record<string, string> = {};
  for (const game of [...curated].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    legacyIds[game.id] = game.slug;
  }
  return {
    catalog: [...catalog],
    curated,
    searchIndex: curated.map((game) => ({
      slug: game.slug,
      title: game.title,
      hub: game.hub,
      tags: game.tags,
    })),
    legacyIds,
    meta: {
      generatedAt: details.now.toISOString(),
      feedModified: details.feedModified,
      validCount: details.validCount,
      invalidCount: details.invalidCount,
      curatedCount: curated.length,
      pagesFetched: details.pagesFetched,
      stale: details.stale,
      hubCounts: hubCounts(curated),
      collectionCounts: Object.fromEntries(
        COLLECTIONS.map((collection) => {
          const count = collectionSize(curated, collection.slug, details.now);
          return [collection.slug, { count, visible: count >= COLLECTION_MIN }];
        }),
      ),
      coverSample: details.coverSample,
      thresholds: {
        minValidGames: MIN_VALID_GAMES,
        maxInvalidRatio: MAX_INVALID_RATIO,
      },
    },
  };
}

function fromSnapshot(input: BuildInput, reason: string): CatalogOutputs {
  const snapshot = input.loadSnapshot();
  if (!snapshot || !catalogWithinThresholds(snapshot.catalog.length, 0)) {
    throw new CatalogError(
      `Catalog build failed (${reason}) and no usable snapshot was found. Refusing to publish an empty catalog.`,
    );
  }
  const coverSample = snapshot.meta?.coverSample ?? {
    requested: 0,
    measured: 0,
    medianAspect: 0,
    aspects: [],
  };
  console.warn(
    `Using the last good catalog snapshot (${reason}). This build is stale.`,
  );
  return assemble(snapshot.catalog, {
    validCount: snapshot.catalog.length,
    invalidCount: snapshot.meta?.invalidCount ?? 0,
    pagesFetched: snapshot.meta?.pagesFetched ?? 0,
    feedModified: snapshot.meta?.feedModified ?? null,
    stale: true,
    coverSample,
    now: input.now ?? new Date(),
  });
}

export async function buildCatalog(input: BuildInput): Promise<CatalogOutputs> {
  const within = input.withinThresholds ?? catalogWithinThresholds;
  try {
    const feed = await input.fetchFeed();
    const normalized = normalizeFeedItems(feed.items);
    if (normalized.unmapped.length > 0) {
      throw new CatalogError(
        `Unmapped categories: ${normalized.unmapped.join(', ')}. Add them in config/taxonomy.ts.`,
      );
    }
    for (const sample of normalized.invalidSamples)
      console.warn(`invalid game: ${sample}`);
    if (!within(normalized.catalog.length, normalized.invalidCount)) {
      console.warn(
        `Catalog thresholds failed: valid=${normalized.catalog.length} invalid=${normalized.invalidCount}`,
      );
      return fromSnapshot(input, 'thresholds');
    }
    const coverSample = await input.measureCovers(normalized.catalog);
    return assemble(normalized.catalog, {
      validCount: normalized.catalog.length,
      invalidCount: normalized.invalidCount,
      pagesFetched: feed.pagesFetched,
      feedModified: feed.feedModified,
      stale: false,
      coverSample,
      now: input.now ?? new Date(),
    });
  } catch (error) {
    if (error instanceof CatalogError) throw error;
    console.warn(
      error instanceof Error ? error.message : 'Catalog fetch failed',
    );
    return fromSnapshot(input, 'fetch');
  }
}
