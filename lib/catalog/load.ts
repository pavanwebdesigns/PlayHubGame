import { readFileSync } from 'node:fs';
import type { GameRecord, SearchIndexEntry } from '@/lib/catalog/types';

let curatedCache: GameRecord[] | null = null;

export function loadCurated(): GameRecord[] {
  if (curatedCache) return curatedCache;
  const parsed = JSON.parse(
    readFileSync('data/curated.json', 'utf8'),
  ) as GameRecord[];
  curatedCache = parsed;
  return parsed;
}

export function loadGame(slug: string): GameRecord | undefined {
  return loadCurated().find((game) => game.slug === slug);
}

export function gamesInHub(hub: string): GameRecord[] {
  return loadCurated().filter((game) => game.hub === hub);
}

export function loadSearchIndex(): SearchIndexEntry[] {
  return JSON.parse(
    readFileSync('data/search-index.json', 'utf8'),
  ) as SearchIndexEntry[];
}
