import type { HubSlug } from '@/config/taxonomy';
import type { TileGame } from '@/lib/tile-game';

const HUBS = new Set<string>([
  'action',
  'adventure',
  'arcade',
  'puzzle',
  'brain-memory',
  'match-3',
  'casual',
  'shooting',
  'racing-driving',
  'sports',
  'strategy',
  'board-card',
  'two-player',
  'girls-dress-up',
  'coloring-drawing',
  'simulation-idle',
  'platformer',
  'skill-hyper-casual',
  'math-word',
  'seasonal',
]);

function readTile(value: unknown): TileGame | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const orientation = row.orientation;
  if (typeof row.slug !== 'string' || row.slug.length === 0) return null;
  if (typeof row.title !== 'string' || row.title.length === 0) return null;
  if (typeof row.cover !== 'string') return null;
  if (typeof row.hub !== 'string' || !HUBS.has(row.hub)) return null;
  if (typeof row.publishedAt !== 'string') return null;
  if (
    orientation !== 'landscape' &&
    orientation !== 'portrait' &&
    orientation !== 'all'
  ) {
    return null;
  }
  if (typeof row.aspect !== 'number') return null;
  return {
    slug: row.slug,
    title: row.title,
    cover: row.cover,
    coverWidth: typeof row.coverWidth === 'number' ? row.coverWidth : null,
    hub: row.hub as HubSlug,
    publishedAt: row.publishedAt,
    orientation,
    aspect: row.aspect,
  };
}

let tileMap: Map<string, TileGame> | null = null;
let started = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeTileMap(listener: () => void): () => void {
  listeners.add(listener);
  if (!started && typeof window !== 'undefined') {
    started = true;
    fetch('/data/tiles.json')
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        const next = new Map<string, TileGame>();
        if (Array.isArray(payload)) {
          for (const row of payload) {
            const tile = readTile(row);
            if (tile) next.set(tile.slug, tile);
          }
        }
        tileMap = next;
        emit();
      })
      .catch(() => {
        tileMap = new Map();
        emit();
      });
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getTileMap(): Map<string, TileGame> | null {
  return tileMap;
}
