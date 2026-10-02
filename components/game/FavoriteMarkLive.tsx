'use client';

import { useSyncExternalStore } from 'react';
import { useSiteIcons } from '@/components/icons/IconProvider';
import {
  isFavoriteSlug,
  readFavoritesSnapshot,
  subscribeFavorites,
} from '@/lib/favorites';

export function FavoriteMarkLive({ slug }: { slug: string }) {
  const raw = useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    () => null,
  );
  const icons = useSiteIcons();
  const saved = isFavoriteSlug(raw, slug);

  return (
    <span
      className="inline-flex h-tap w-tap items-center justify-center"
      role={saved ? 'img' : undefined}
      aria-label={saved ? 'Saved' : undefined}
      aria-hidden={saved ? undefined : true}
    >
      <span
        className={
          saved
            ? '[&_svg]:fill-spark [&_svg]:text-spark'
            : '[&_svg]:fill-transparent [&_svg]:text-transparent'
        }
      >
        {icons.heart}
      </span>
    </span>
  );
}
