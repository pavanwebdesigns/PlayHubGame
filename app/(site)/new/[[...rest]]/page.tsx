import { notFound } from 'next/navigation';
import { GameListing } from '@/components/listing/GameListing';
import { loadCurated } from '@/lib/catalog/load';
import { pageCount, pageSlice } from '@/lib/listing';
import { listingGames, listingRests, parsedListing } from '@/lib/listing-build';
import { listingMeta } from '@/lib/listing-meta';
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
  const filtered = listingGames(loadCurated(), query);
  const meta = listingMeta({
    name: 'New',
    summary: 'The newest free browser games on PlayHubPlace.',
    query,
    pages: pageCount(filtered.length),
    base: '/new',
    defaultSort: 'new',
    indexable: true,
    kind: 'new',
  });
  return pageMetadata({ ...meta, absoluteTitle: true });
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
