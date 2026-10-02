import { notFound } from 'next/navigation';
import { GameListing } from '@/components/listing/GameListing';
import { loadCurated } from '@/lib/catalog/load';
import { listingPath, pageCount, pageSlice } from '@/lib/listing';
import { listingGames, listingRests, parsedListing } from '@/lib/listing-build';
import { pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

export const dynamicParams = false;

export function generateStaticParams() {
  const games = loadCurated();
  return listingRests(games, { defaultSort: 'new', tags: false }).map((rest) => ({
    rest,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const query = parsedListing(rest, 'new');
  if (!query) return {};
  return pageMetadata({
    title: 'New games',
    description: 'The newest free browser games on PlayHubPlace.',
    path: listingPath('/new', query, 'new'),
    index: true,
  });
}

export default async function NewPage({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const query = parsedListing(rest, 'new');
  if (!query) notFound();
  const filtered = listingGames(loadCurated(), query);
  const pages = pageCount(filtered.length);
  if (filtered.length === 0 || query.page > pages) notFound();
  return (
    <GameListing
      title="New games"
      intro={null}
      games={pageSlice(filtered, query.page).map((game) => toTileGame(game))}
      query={query}
      pages={pages}
      base="/new"
      defaultSort="new"
      crumbs={[
        { href: '/', label: 'Home' },
        { href: '/new/', label: 'New games' },
      ]}
    />
  );
}
