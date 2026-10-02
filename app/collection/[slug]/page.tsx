import { notFound } from 'next/navigation';
import { GameLinks } from '@/components/game/GameLinks';
import { COLLECTIONS, visibleCollections } from '@/config/collections';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { hasContent } from '@/lib/content-gate';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  const now = buildToday();
  return visibleCollections(loadCurated(), now).map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = COLLECTIONS.find((item) => item.slug === slug);
  if (!collection) return {};
  return pageMetadata({
    title: collection.name,
    description: `${collection.name} you can play free in your browser on PlayHubPlace.`,
    path: `/collection/${collection.slug}/`,
    index: hasContent('collections', collection.slug),
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = buildToday();
  const collection = visibleCollections(loadCurated(), now).find(
    (item) => item.slug === slug,
  );
  if (!collection) notFound();
  const games = loadCurated().filter((game) => collection.matches(game, now));
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-3xl text-ink">{collection.name}</h1>
      <GameLinks games={games} />
    </main>
  );
}
