import { GameTile } from '@/components/game/GameTile';
import type { TileGame } from '@/lib/tile-game';

export function Row({
  title,
  href,
  games,
}: {
  title: string;
  href: string;
  games: readonly TileGame[];
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-title text-ink">{title}</h2>
        <a href={href} className="inline-flex min-h-tap items-center text-play">
          See all
        </a>
      </div>
      <div className="row-scroller" tabIndex={0} role="region" aria-label={title}>
        {games.map((game) => (
          <GameTile key={game.slug} game={game} size="row" />
        ))}
      </div>
    </section>
  );
}
