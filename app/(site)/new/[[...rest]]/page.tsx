import { notFound } from 'next/navigation';
import { GameListing } from '@/components/listing/GameListing';
import { loadCurated } from '@/lib/catalog/load';
import { loadContent } from '@/lib/content';
import { isIndexable } from '@/lib/content-gate';
import { pageCount, pageSlice } from '@/lib/listing';
import { listingGames, listingRests, parsedListing } from '@/lib/listing-build';
import { listingMeta } from '@/lib/listing-meta';
import { pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

const newDoc = loadContent('pages', 'new');
const newSummary = newDoc?.summary ?? '';
if (newSummary.length < 140 || newSummary.length > 160) {
  throw new Error(
    `content/pages/new.mdx summary is ${newSummary.length} characters; it must be 140–160`,
  );
}

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
    summary: newSummary,
    query,
    pages: pageCount(filtered.length),
    base: '/new',
    defaultSort: 'new',
    indexable: isIndexable('pages', 'new'),
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
      intro={newDoc}
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
