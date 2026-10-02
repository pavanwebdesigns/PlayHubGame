import { notFound } from 'next/navigation';
import { GameLinks } from '@/components/game/GameLinks';
import { HUB_NAMES, HUB_SLUGS, type HubSlug } from '@/config/taxonomy';
import { gamesInHub } from '@/lib/catalog/load';
import { hasContent } from '@/lib/content-gate';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

function isHub(value: string): value is HubSlug {
  return (HUB_SLUGS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return HUB_SLUGS.filter((hub) => gamesInHub(hub).length > 0).map((hub) => ({
    hub,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub } = await params;
  if (!isHub(hub)) return {};
  const name = HUB_NAMES[hub];
  return pageMetadata({
    title: name,
    description: `${name} games you can play free in your browser on PlayHubPlace.`,
    path: `/category/${hub}/`,
    index: hasContent('hubs', hub),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub } = await params;
  if (!isHub(hub)) notFound();
  const games = gamesInHub(hub);
  if (games.length === 0) notFound();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-3xl text-ink">{HUB_NAMES[hub]}</h1>
      <GameLinks games={games} />
    </main>
  );
}
