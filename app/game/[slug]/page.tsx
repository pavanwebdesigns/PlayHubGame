import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GameFrame } from '@/components/game/GameFrame';
import { GameLinks } from '@/components/game/GameLinks';
import { HUB_NAMES } from '@/config/taxonomy';
import { hasContent } from '@/lib/content-gate';
import { loadCurated, loadGame } from '@/lib/catalog/load';
import { coverAtWidth } from '@/lib/catalog/urls';
import { gameTitle, pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return loadCurated().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = loadGame(slug);
  if (!game) return {};
  return pageMetadata({
    title: gameTitle(game.title),
    description: `Play ${game.title} free in your browser on PlayHubPlace. No download.`,
    path: `/game/${game.slug}/`,
    index: hasContent('games', game.slug),
    absoluteTitle: true,
    image: coverAtWidth(game.cover, 640),
  });
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = loadGame(slug);
  if (!game) notFound();
  const hubName = HUB_NAMES[game.hub];
  const similar = loadCurated()
    .filter((item) => item.hub === game.hub && item.slug !== game.slug)
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-ink-muted">
        <Link href="/" className="min-h-11 inline-flex items-center">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          href={`/category/${game.hub}/`}
          className="min-h-11 inline-flex items-center"
        >
          {hubName}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{game.title}</span>
      </nav>
      <h1 className="mb-4 text-3xl text-ink">{game.title}</h1>
      <GameFrame game={game} />
      <div className="h-40" aria-hidden="true" />
      <p className="max-w-prose text-ink-muted">
        Play {game.title} in your browser. No download and no account.
      </p>
      <p className="mt-2 text-ink-muted">Category: {hubName}</p>
      <section className="mt-8">
        <h2 className="mb-3 text-2xl text-ink">Similar games</h2>
        <GameLinks games={similar} />
      </section>
    </main>
  );
}
