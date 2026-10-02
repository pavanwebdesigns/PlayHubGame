import { Puzzle } from 'lucide-react';
import { CategoryCard } from '@/components/game/CategoryCard';
import { GameTile } from '@/components/game/GameTile';
import { Row } from '@/components/game/Row';
import { Spotlight } from '@/components/game/Spotlight';
import { TileGrid } from '@/components/game/TileGrid';
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

export function GameSections() {
  const year = buildToday().getUTCFullYear();
  const first = sampleGames[0];
  const second = sampleGames[1];
  if (!first || !second) return null;

  return (
    <>
      <section id="game-tile" className="grid gap-3">
        <h2 className="text-title">Game tile</h2>
        <div className="grid max-w-sm gap-4">
          <GameTile game={first} size="md" />
          <GameTile game={second} size="lg" />
          <GameTile game={sampleGames[2] ?? first} size="md" />
        </div>
      </section>

      <section id="tile-grid" className="grid gap-3">
        <h2 className="text-title">Tile grid</h2>
        <TileGrid
          tiles={[
            { game: first, size: 'xl' },
            { game: second, size: 'md' },
            { game: sampleGames[3] ?? first, size: 'lg' },
            { game: sampleGames[4] ?? second, size: 'md' },
          ]}
        />
      </section>

      <section id="row" className="grid gap-3">
        <h2 className="text-title">Row</h2>
        <Row
          title="Sample row"
          href="/collection/one-thumb/"
          games={sampleGames}
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
          icon={Puzzle}
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
