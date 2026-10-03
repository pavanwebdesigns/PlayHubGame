import type { HubSlug } from '@/config/taxonomy';

export type Orientation = 'landscape' | 'portrait' | 'all';

/** Normalized catalog row. `publisherDescription` is the feed text, never our body copy. */
export type GameRecord = {
  id: string;
  slug: string;
  title: string;
  publisherDescription: string;
  rawCategory: string;
  hub: HubSlug;
  tags: string[];
  orientation: Orientation;
  quality: number;
  publishedAt: string;
  updatedAt: string;
  aspect: number;
  /** Pixel width of the source cover. Null means it could not be measured. */
  coverWidth: number | null;
  cover: string;
  icon: string;
  embedUrl: string;
};

export type SearchIndexEntry = {
  slug: string;
  title: string;
  hub: HubSlug;
  tags: string[];
};

export type CoverSample = {
  requested: number;
  measured: number;
  medianAspect: number;
  aspects: number[];
};

export type CatalogMeta = {
  generatedAt: string;
  feedModified: string | null;
  validCount: number;
  invalidCount: number;
  curatedCount: number;
  pagesFetched: number;
  stale: boolean;
  hubCounts: Record<string, number>;
  collectionCounts: Record<string, { count: number; visible: boolean }>;
  coverSample: CoverSample;
  thresholds: {
    minValidGames: number;
    maxInvalidRatio: number;
  };
};
