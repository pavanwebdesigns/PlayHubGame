'use client';

import { useEffect } from 'react';
import { track, trackingOpen } from '@/lib/analytics';

function numberAttr(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Listens for tile clicks only after analytics is allowed. Renders nothing. */
export function AnalyticsBoot() {
  useEffect(() => {
    if (!trackingOpen()) return;
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const save = target.closest('button[data-save]');
      if (save instanceof HTMLButtonElement) {
        const blocked = document.getElementById('ph-toast')?.textContent?.includes('not available');
        if (!blocked) {
          track({
            name: save.getAttribute('aria-pressed') === 'true' ? 'favorite_add' : 'favorite_remove',
            slug: save.dataset.save ?? '',
          });
        }
        return;
      }
      const link = target.closest('a[data-slug][data-source]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const wide = window.matchMedia('(min-width: 769px)').matches;
      const position = wide
        ? numberAttr(link.dataset.positionWide ?? link.dataset.position ?? null)
        : numberAttr(link.dataset.position ?? null);
      track({
        name: 'tile_click',
        slug: link.dataset.slug ?? '',
        source: link.dataset.source ?? '',
        position,
      });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
