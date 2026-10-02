import { SiteChrome } from '@/components/layout/SiteChrome';
import { Row } from '@/components/game/Row';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { todaysPicks } from '@/lib/picks';
import { toTileGame } from '@/lib/tile-game';

export default function NotFound() {
  const picks = todaysPicks(loadCurated(), buildToday(), false)
    .slice(0, 12)
    .map((game) => toTileGame(game));
  return (
    <SiteChrome>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-display-sm text-ink">This page doesn’t exist.</h1>
        <form action="/search/" method="get" className="mt-4 flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="missing-q">
            Search games
          </label>
          <input
            id="missing-q"
            name="q"
            className="min-h-tap min-w-0 flex-1 rounded-input border border-edge bg-deck px-3 text-ink"
          />
          <button
            type="submit"
            className="inline-flex min-h-tap items-center rounded-button bg-play px-5 text-night"
          >
            Search
          </button>
        </form>
        <div className="mt-8">
          <Row title="Today’s picks" href="/" games={picks} />
        </div>
      </main>
    </SiteChrome>
  );
}
