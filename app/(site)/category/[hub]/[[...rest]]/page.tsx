import { notFound } from 'next/navigation';
import { GameListing } from '@/components/listing/GameListing';
import { HUB_NAMES, HUB_SLUGS, type HubSlug } from '@/config/taxonomy';
import { gamesInHub } from '@/lib/catalog/load';
import { loadContent } from '@/lib/content';
import { isIndexable } from '@/lib/content-gate';
import { listingPath, pageCount, pageSlice, rawTags } from '@/lib/listing';
import { listingGames, listingRests, parsedListing } from '@/lib/listing-build';
import { pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

export const dynamicParams = false;

function isHub(value: string): value is HubSlug {
  return (HUB_SLUGS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  const params: { hub: string; rest?: string[] }[] = [];
  for (const hub of HUB_SLUGS) {
    const games = gamesInHub(hub);
    if (games.length === 0) continue;
    for (const rest of listingRests(games, { defaultSort: 'popular', tags: true })) {
      params.push({ hub, rest });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; rest?: string[] }>;
}) {
  const { hub, rest } = await params;
  if (!isHub(hub)) return {};
  const query = parsedListing(rest, 'popular');
  if (!query) return {};
  const doc = loadContent('categories', hub);
  const name = HUB_NAMES[hub];
  return pageMetadata({
    title: `${name} games`,
    description:
      doc?.summary ??
      `${name} games you can play free in your browser on PlayHubPlace.`,
    path: listingPath('/category/' + hub, query, 'popular'),
    index: isIndexable('categories', hub),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ hub: string; rest?: string[] }>;
}) {
  const { hub, rest } = await params;
  if (!isHub(hub)) notFound();
  const query = parsedListing(rest, 'popular');
  if (!query) notFound();
  const all = gamesInHub(hub);
  if (all.length === 0) notFound();
  const filtered = listingGames(all, query);
  const pages = pageCount(filtered.length);
  if (query.page > pages) notFound();
  const name = HUB_NAMES[hub];
  return (
    <GameListing
      title={`${name} games`}
      intro={loadContent('categories', hub)}
      games={pageSlice(filtered, query.page).map((game) => toTileGame(game))}
      query={query}
      pages={pages}
      base={`/category/${hub}`}
      tags={rawTags(all)}
      crumbs={[
        { href: '/', label: 'Home' },
        { href: `/category/${hub}/`, label: name },
      ]}
    />
  );
}
