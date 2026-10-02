'use client';

import { useEffect, useState, type ComponentType } from 'react';

export function FavoriteMark({ slug }: { slug: string }) {
  const [Live, setLive] = useState<ComponentType<{ slug: string }> | null>(null);

  useEffect(() => {
    let cancel = false;
    const start = () => {
      void import('./FavoriteMarkLive').then((mod) => {
        if (!cancel) setLive(() => mod.FavoriteMarkLive);
      });
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start);
      return () => {
        cancel = true;
        window.cancelIdleCallback(id);
      };
    }
    const timer = window.setTimeout(start, 1);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!Live) {
    return <span className="inline-flex h-tap w-tap" aria-hidden="true" />;
  }
  return <Live slug={slug} />;
}
