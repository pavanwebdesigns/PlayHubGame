import type { ReactNode } from 'react';
import { GameTile } from '@/components/game/GameTile';
import { IconButton } from '@/components/ui/IconButton';
import type { TileGame } from '@/lib/tile-game';

export function Row({
  title,
  href,
  games,
  previous,
  next,
}: {
  title: string;
  href: string;
  games: readonly TileGame[];
  previous: ReactNode;
  next: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-title text-ink">{title}</h2>
        <a href={href} className="inline-flex min-h-tap items-center text-play">
          See all
        </a>
      </div>
      <div className="row-wrap relative min-w-0">
        <div className="row-scroller" tabIndex={0} role="region" aria-label={title}>
          {games.map((game) => (
            <GameTile key={game.slug} game={game} size="row" />
          ))}
        </div>
        <div className="row-edge row-edge-prev">
          <IconButton
            label="Previous games"
            icon={previous}
            className="bg-deck"
            data-row-move="prev"
            hidden
          />
        </div>
        <div className="row-edge row-edge-next">
          <IconButton
            label="Next games"
            icon={next}
            className="bg-deck"
            data-row-move="next"
            hidden
          />
        </div>
      </div>
    </section>
  );
}
