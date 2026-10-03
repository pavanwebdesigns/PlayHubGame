import { Icon } from '@/components/icons/glyphs';
import { CategoryCard } from '@/components/game/CategoryCard';
import { GameTile } from '@/components/game/GameTile';
import { Row } from '@/components/game/Row';
import { Spotlight } from '@/components/game/Spotlight';
import { TileGrid } from '@/components/game/TileGrid';
import { mdTilesToRender, TILE_COLUMNS } from '@/lib/tile-pack';
import type { TileGame } from '@/lib/tile-game';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { SideRail } from '@/components/layout/SideRail';
import { TopBar } from '@/components/layout/TopBar';
import { sampleGames } from '@/components/dev/samples';
import { buildToday } from '@/lib/build-clock';

const categories = [
  { href: '/category/puzzle/', label: 'Puzzle' },
  { href: '/category/racing-driving/', label: 'Racing & Driving' },
];

const collections = [
  { href: '/collection/one-thumb/', label: 'One-thumb games' },
];

function galleryTiles(games: readonly TileGame[]) {
  const lead = games[0];
  const rest = games.slice(1);
  if (!lead || rest.length === 0) return [];
  const mdCount = mdTilesToRender(rest.length);
  const tiles: { game: TileGame; size: 'xl' | 'md' }[] = [
    { game: lead, size: 'xl' },
  ];
  for (let index = 0; index < mdCount; index += 1) {
    const game = rest[index % rest.length];
    if (game) tiles.push({ game, size: 'md' });
  }
  return tiles;
}

export function GameSections() {
  const year = buildToday().getUTCFullYear();
  const first = sampleGames[0];
  const second = sampleGames[1];
  const missing = sampleGames[2];
  if (!first || !second || !missing) return null;
  const tiles = galleryTiles(sampleGames);

  return (
    <>
      <section id="game-tile" className="grid gap-3">
        <h2 className="text-title">Game tile</h2>
        <div className="grid max-w-sm gap-4">
          <GameTile game={first} size="md" />
          <GameTile game={missing} size="md" />
        </div>
      </section>

      <section id="tile-grid" className="grid min-w-0 gap-6">
        <h2 className="text-title">Tile grid</h2>
        {TILE_COLUMNS.map((columns) => (
          <div key={columns} className="grid min-w-0 gap-3">
            <h3 className="text-lead">{columns} columns</h3>
            <div className="min-w-0 overflow-x-auto">
              <TileGrid columns={columns} tiles={tiles} />
            </div>
          </div>
        ))}
      </section>

      <section id="row" className="grid min-w-0 gap-3">
        <h2 className="text-title">Row</h2>
        <Row
          title="Sample row"
          href="/collection/one-thumb/"
          games={sampleGames}
          previous={<Icon name="chevron-left" />}
          next={<Icon name="chevron-right" />}
        />
      </section>

      <section id="spotlight" className="grid gap-4">
        <h2 className="text-title">Spotlight</h2>
        <Spotlight game={first} />
        <Spotlight game={second} />
      </section>

      <section id="category-card" className="grid gap-3">
        <h2 className="text-title">Category card</h2>
        <CategoryCard
          href="/category/puzzle/"
          icon={<Icon name="puzzle" size={24} />}
          name="Puzzle"
          count={95}
        />
      </section>

      <section id="top-bar" className="grid gap-3">
        <h2 className="text-title">Top bar</h2>
        <TopBar preview />
      </section>

      <section id="bottom-nav" className="grid gap-3">
        <h2 className="text-title">Bottom nav</h2>
        <BottomNav
          preview
          active="home"
          categories={categories}
          collections={collections}
        />
      </section>

      <section id="side-rail" className="grid gap-3">
        <h2 className="text-title">Side rail</h2>
        <SideRail
          preview
          collections={[{ slug: 'one-thumb', label: 'One-thumb games' }]}
          hubs={[{ slug: 'puzzle', label: 'Puzzle', count: 95 }]}
        />
      </section>

      <section id="footer" className="grid gap-3">
        <h2 className="text-title">Footer</h2>
        <Footer year={year} />
      </section>
    </>
  );
}
