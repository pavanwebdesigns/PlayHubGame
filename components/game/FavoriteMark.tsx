'use client';

import { Heart } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import {
  isFavoriteSlug,
  readFavoritesSnapshot,
  subscribeFavorites,
} from '@/lib/favorites';

export function FavoriteMark({ slug }: { slug: string }) {
  const raw = useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    () => null,
  );
  const saved = isFavoriteSlug(raw, slug);

  return (
    <span
      className="inline-flex h-tap w-tap items-center justify-center"
      role={saved ? 'img' : undefined}
      aria-label={saved ? 'Saved' : undefined}
      aria-hidden={saved ? undefined : true}
    >
      <Heart
        aria-hidden="true"
        size={20}
        className={
          saved ? 'fill-spark text-spark' : 'fill-transparent text-transparent'
        }
      />
    </span>
  );
}
