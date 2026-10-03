import type { GameRecord } from '@/lib/catalog/types';

/** Existing key. New keys use ph:<name>:v1. */
export const FAVORITES_KEY = 'playhub_favorites';

export type StoredFavorite = {
  id: string;
  title: string;
  namespace: string;
  description: string;
  category: string;
  orientation: 'landscape' | 'portrait' | 'all';
  quality_score: number;
  width: number;
  height: number;
  date_published: string;
  date_modified: string;
  banner_image: string;
  image: string;
  url: string;
};

export function readFavorites(raw: string | null): StoredFavorite[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const game = item as Record<string, unknown>;
      if (
        game.id == null ||
        typeof game.title !== 'string' ||
        game.title.length === 0
      ) {
        return [];
      }
      const orientation = game.orientation;
      return [
        {
          id: String(game.id),
          title: game.title,
          namespace: typeof game.namespace === 'string' ? game.namespace : '',
          description:
            typeof game.description === 'string' ? game.description : '',
          category: typeof game.category === 'string' ? game.category : '',
          orientation:
            orientation === 'landscape' ||
            orientation === 'portrait' ||
            orientation === 'all'
              ? orientation
              : 'all',
          quality_score:
            typeof game.quality_score === 'number' ? game.quality_score : 0,
          width: typeof game.width === 'number' ? game.width : 0,
          height: typeof game.height === 'number' ? game.height : 0,
          date_published:
            typeof game.date_published === 'string' ? game.date_published : '',
          date_modified:
            typeof game.date_modified === 'string' ? game.date_modified : '',
          banner_image:
            typeof game.banner_image === 'string' ? game.banner_image : '',
          image: typeof game.image === 'string' ? game.image : '',
          url: typeof game.url === 'string' ? game.url : '',
        },
      ];
    });
  } catch {
    return [];
  }
}

export function favoriteFromGame(game: GameRecord): StoredFavorite {
  return {
    id: game.id,
    title: game.title,
    namespace: game.slug,
    description: '',
    category: game.rawCategory,
    orientation: game.orientation,
    quality_score: game.quality,
    width: Math.round(game.aspect * 600),
    height: 600,
    date_published: game.publishedAt,
    date_modified: game.updatedAt,
    banner_image: game.cover,
    image: game.icon,
    url: game.embedUrl,
  };
}

const listeners = new Set<() => void>();

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitFavorites(): void {
  for (const listener of listeners) listener();
}

export function readFavoritesSnapshot(): string | null {
  try {
    return localStorage.getItem(FAVORITES_KEY);
  } catch {
    return null;
  }
}

export function isFavoriteSlug(raw: string | null, slug: string): boolean {
  return readFavorites(raw).some(
    (item) => item.namespace === slug || item.id === slug,
  );
}

export function writeFavorites(games: readonly StoredFavorite[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(games));
  } catch {
    return;
  }
  emitFavorites();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === FAVORITES_KEY) emitFavorites();
  });
}
