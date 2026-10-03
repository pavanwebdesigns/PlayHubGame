import { AboutHome } from '@/components/home/AboutHome';
import { CategorySection } from '@/components/home/CategorySection';
import { ContinuePlayingSlot } from '@/components/home/ContinuePlayingSlot';
import { OriginalsRow } from '@/components/home/OriginalsRow';
import { Row } from '@/components/game/Row';
import { Icon } from '@/components/icons/glyphs';
import { Spotlight } from '@/components/game/Spotlight';
import { TileGrid } from '@/components/game/TileGrid';
import { visibleCollections, type CollectionSlug } from '@/config/collections';
import { activeSeasonal } from '@/config/seasonal';
import { dayOfYear, spotlightChoice } from '@/config/spotlight';
import { HUB_SLUGS } from '@/config/taxonomy';
import { SITE_NAME } from '@/config/site';
import { XL_COVER_MIN } from '@/lib/catalog/cover-widths';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { loadContent } from '@/lib/content';
import { rankByQuality, todaysPicks } from '@/lib/picks';
import { HOME_TITLE, pageMetadata } from '@/lib/seo';
import { toTileGame, type TileGame } from '@/lib/tile-game';
import type { GameRecord } from '@/lib/catalog/types';

const ROW_ORDER: readonly CollectionSlug[] = [
  'one-thumb',
  'train-your-brain',
  'five-minute',
  'two-players',
  'just-relax',
  'new-this-week',
];

function featured(games: readonly GameRecord[]) {
  let xlUsed = false;
  return games.map((game) => {
    const sharp = (game.coverWidth ?? 0) >= XL_COVER_MIN;
    const size = !xlUsed && sharp ? 'xl' : 'md';
    if (size === 'xl') xlUsed = true;
    return { game: toTileGame(game), size } as const;
  });
}

function rowOf(
  games: readonly GameRecord[],
  take: (game: GameRecord) => boolean,
): TileGame[] {
  return rankByQuality(games.filter(take))
    .slice(0, 16)
    .map((game) => toTileGame(game));
}

const homeDoc = loadContent('pages', 'home');

export const metadata = pageMetadata({
  title: HOME_TITLE,
  description: homeDoc?.summary ?? HOME_TITLE,
  path: '/',
  index: true,
  absoluteTitle: true,
});

export default function HomePage() {
  const games = loadCurated();
  const now = buildToday();
  const available = new Set(games.map((game) => game.slug));
  const lowRes = new Set(
    games
      .filter((game) => (game.coverWidth ?? 0) < XL_COVER_MIN)
      .map((game) => game.slug),
  );
  const choice = spotlightChoice(available, dayOfYear(now), lowRes);
  if (choice.lowRes.length > 0) {
    console.warn(`Spotlight low-res, falling back: ${choice.lowRes.join(', ')}`);
  }
  if (choice.skipped.length > 0) {
    console.warn(`Spotlight skipped: ${choice.skipped.join(', ')}`);
  }
  const spotlight =
    games.find((game) => game.slug === choice.slug) ??
    rankByQuality(games).find((game) => (game.coverWidth ?? 0) >= XL_COVER_MIN);
  const visible = visibleCollections(games, now);
  const hubs = HUB_SLUGS.flatMap((slug) => {
    const count = games.filter((game) => game.hub === slug).length;
    return count > 0 ? [{ slug, count }] : [];
  });

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-6">
      <h1 className="font-display text-display text-ink">{SITE_NAME}</h1>
      <ContinuePlayingSlot />
      {spotlight ? <Spotlight game={toTileGame(spotlight)} /> : null}
      <section>
        <h2 className="mb-3 text-title text-ink">Today’s picks</h2>
        <div className="picks-wide">
          <TileGrid tiles={featured(todaysPicks(games, now, false))} />
        </div>
        <div className="picks-thumb">
          <TileGrid tiles={featured(todaysPicks(games, now, true))} />
        </div>
      </section>
      <div className="home-rows">
        {ROW_ORDER.flatMap((slug) => {
          const collection = visible.find((item) => item.slug === slug);
          if (!collection) return [];
          const row = rowOf(games, (game) => collection.matches(game, now));
          if (row.length === 0) return [];
          return [
            <div
              key={slug}
              className={slug === 'new-this-week' ? 'home-row home-row-new' : 'home-row'}
            >
              <Row
                title={collection.name}
                href={`/collection/${collection.slug}/`}
                games={row}
                previous={<Icon name="chevron-left" />}
                next={<Icon name="chevron-right" />}
              />
            </div>,
          ];
        })}
        {activeSeasonal(now).flatMap((season) => {
          const row = rowOf(games, (game) => game.rawCategory === season.rawCategory);
          if (row.length === 0) return [];
          return [
            <div key={season.id} className="home-row">
              <Row
                title={season.name}
                href="/category/seasonal/"
                games={row}
                previous={<Icon name="chevron-left" />}
                next={<Icon name="chevron-right" />}
              />
            </div>,
          ];
        })}
      </div>
      <OriginalsRow />
      <CategorySection hubs={hubs} />
      {homeDoc ? <AboutHome doc={homeDoc} /> : null}
    </main>
  );
}
