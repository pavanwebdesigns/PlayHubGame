import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { HUB_NAMES, type HubSlug } from '@/config/taxonomy';
import type { CatalogMeta, GameRecord } from '@/lib/catalog/types';

const HUB_SLUG_LIST = Object.keys(HUB_NAMES) as [HubSlug, ...HubSlug[]];

const gameRecordSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  publisherDescription: z.string(),
  rawCategory: z.string().min(1),
  hub: z.enum(HUB_SLUG_LIST),
  tags: z.array(z.string()),
  orientation: z.enum(['landscape', 'portrait', 'all']),
  quality: z.number().finite(),
  publishedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  aspect: z.number().positive(),
  cover: z.string().min(1),
  icon: z.string().min(1),
  embedUrl: z.string().min(1),
});

export type CatalogSnapshot = {
  catalog: GameRecord[];
  meta: CatalogMeta | null;
};

export function snapshotSearchDirs(): string[] {
  return [
    process.env.CATALOG_CACHE_DIR,
    process.env.CATALOG_SNAPSHOT_DIR,
  ].filter((dir): dir is string => typeof dir === 'string' && dir.length > 0);
}

export function readSnapshot(dir: string): CatalogSnapshot | null {
  try {
    const catalogJson = JSON.parse(
      readFileSync(`${dir}/catalog.json`, 'utf8'),
    ) as unknown;
    const parsed = z.array(gameRecordSchema).safeParse(catalogJson);
    if (!parsed.success) return null;
    let meta: CatalogMeta | null = null;
    try {
      meta = JSON.parse(
        readFileSync(`${dir}/meta.json`, 'utf8'),
      ) as CatalogMeta;
    } catch {
      meta = null;
    }
    return { catalog: parsed.data, meta };
  } catch {
    return null;
  }
}

export function readFirstSnapshot(
  dirs: readonly string[],
): CatalogSnapshot | null {
  for (const dir of dirs) {
    const snapshot = readSnapshot(dir);
    if (snapshot && snapshot.catalog.length > 0) return snapshot;
  }
  return null;
}
