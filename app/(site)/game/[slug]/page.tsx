import { notFound } from 'next/navigation';
import { GameCopy } from '@/components/game/GameCopy';
import { GamePlay } from '@/components/game/GamePlay';
import { GameTile } from '@/components/game/GameTile';
import { UpNext } from '@/components/game/UpNext';
import { JsonLd } from '@/components/seo/JsonLd';
import { HUB_NAMES } from '@/config/taxonomy';
import { favoriteFromGame } from '@/lib/favorites';
import { isIndexable } from '@/lib/content-gate';
import { loadCurated, loadGame } from '@/lib/catalog/load';
import { coverAtWidth } from '@/lib/catalog/urls';
import { loadContent } from '@/lib/content';
import { similarGames } from '@/lib/similar';
import { absoluteUrl, gameTitle, ogCover, pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

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
  const doc = loadContent('games', game.slug);
  return pageMetadata({
    title: gameTitle(game.title),
    description:
      doc?.summary ??
      `Play ${game.title} free in your browser on PlayHubPlace. No download.`,
    path: `/game/${game.slug}/`,
    index: isIndexable('games', game.slug),
    absoluteTitle: true,
    image: ogCover(game.cover, game.coverWidth),
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
  const ranked = similarGames(loadCurated(), game.slug, game.hub, 12);
  const tiles = ranked.map((item) => toTileGame(item));
  const upNext = tiles[0];
  const hubName = HUB_NAMES[game.hub];
  return (
    <main className="px-4 py-6">
      <link rel="preconnect" href="https://play.gamepix.com" />
      <nav aria-label="Breadcrumb" className="mb-4 text-ink-muted">
        <a href="/" className="inline-flex min-h-tap items-center">
          Home
        </a>
        <span aria-hidden="true"> › </span>
        <a
          href={`/category/${game.hub}/`}
          className="inline-flex min-h-tap items-center"
        >
          {hubName}
        </a>
        <span aria-hidden="true"> › </span>
        <span className="text-ink">{game.title}</span>
      </nav>
      <GamePlay
        game={{
          slug: game.slug,
          title: game.title,
          cover: game.cover,
          coverWidth: game.coverWidth,
          embedUrl: game.embedUrl,
          orientation: game.orientation,
          aspect: game.aspect,
        }}
        favorite={favoriteFromGame(game)}
        upNextHref={upNext ? `/game/${upNext.slug}/` : '/'}
        rail={tiles.map((item) => (
          <GameTile key={item.slug} game={item} size="row" />
        ))}
      >
        <GameCopy
          game={game}
          similar={tiles}
          upNext={<UpNext candidates={tiles.slice(0, 8)} />}
        />
      </GamePlay>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': ['VideoGame', 'SoftwareApplication'],
              name: game.title,
              url: absoluteUrl(`/game/${game.slug}/`),
              applicationCategory: 'Game',
              operatingSystem: 'Web',
              image: coverAtWidth(game.cover, 640),
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: hubName,
                  item: absoluteUrl(`/category/${game.hub}/`),
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: game.title,
                  item: absoluteUrl(`/game/${game.slug}/`),
                },
              ],
            },
          ],
        }}
      />
    </main>
  );
}
