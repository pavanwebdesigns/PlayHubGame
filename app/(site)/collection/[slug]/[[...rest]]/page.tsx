import { notFound } from 'next/navigation';
import { GameListing } from '@/components/listing/GameListing';
import { COLLECTIONS, visibleCollections } from '@/config/collections';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { loadContent } from '@/lib/content';
import { isIndexable } from '@/lib/content-gate';
import { listingPath, pageCount, pageSlice } from '@/lib/listing';
import { listingGames, listingRests, parsedListing } from '@/lib/listing-build';
import { pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

export const dynamicParams = false;

export function generateStaticParams() {
  const now = buildToday();
  const games = loadCurated();
  const params: { slug: string; rest?: string[] }[] = [];
  for (const collection of visibleCollections(games, now)) {
    const matched = games.filter((game) => collection.matches(game, now));
    for (const rest of listingRests(matched, { defaultSort: 'popular', tags: false })) {
      params.push({ slug: collection.slug, rest });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; rest?: string[] }>;
}) {
  const { slug, rest } = await params;
  const collection = COLLECTIONS.find((item) => item.slug === slug);
  const query = parsedListing(rest, 'popular');
  if (!collection || !query) return {};
  const doc = loadContent('collections', slug);
  return pageMetadata({
    title: collection.name,
    description:
      doc?.summary ??
      `${collection.name} you can play free in your browser on PlayHubPlace.`,
    path: listingPath(`/collection/${slug}`, query, 'popular'),
    index: isIndexable('collections', slug),
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string; rest?: string[] }>;
}) {
  const { slug, rest } = await params;
  const now = buildToday();
  const games = loadCurated();
  const collection = visibleCollections(games, now).find((item) => item.slug === slug);
  const query = parsedListing(rest, 'popular');
  if (!collection || !query) notFound();
  const matched = games.filter((game) => collection.matches(game, now));
  const filtered = listingGames(matched, query);
  const pages = pageCount(filtered.length);
  if (query.page > pages) notFound();
  return (
    <GameListing
      title={collection.name}
      intro={loadContent('collections', slug)}
      games={pageSlice(filtered, query.page).map((game) => toTileGame(game))}
      query={query}
      pages={pages}
      base={`/collection/${slug}`}
      crumbs={[
        { href: '/', label: 'Home' },
        { href: `/collection/${slug}/`, label: collection.name },
      ]}
    />
  );
}
