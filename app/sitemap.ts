import type { MetadataRoute } from 'next';
import { visibleCollections } from '@/config/collections';
import { HUB_SLUGS } from '@/config/taxonomy';
import { gamesInHub, loadCurated } from '@/lib/catalog/load';
import { hasContent } from '@/lib/content-gate';
import { buildToday } from '@/lib/build-clock';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = buildToday();
  const paths = [
    '/',
    '/new/',
    '/about/',
    '/contact/',
    '/privacy/',
    '/cookies/',
    '/terms/',
    '/originals/reaction-time-test/',
    '/originals/cps-test/',
  ];
  for (const hub of HUB_SLUGS) {
    if (gamesInHub(hub).length > 0 && hasContent('hubs', hub))
      paths.push(`/category/${hub}/`);
  }
  for (const collection of visibleCollections(loadCurated(), now)) {
    if (hasContent('collections', collection.slug)) {
      paths.push(`/collection/${collection.slug}/`);
    }
  }
  for (const game of loadCurated()) {
    if (hasContent('games', game.slug)) paths.push(`/game/${game.slug}/`);
  }
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
