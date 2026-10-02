'use client';

import { useState, type ReactNode } from 'react';
import { Player, type PlayGame } from '@/components/game/Player';
import { AdSlot } from '@/components/ui/AdSlot';
import type { StoredFavorite } from '@/lib/favorites';

export function GamePlay({
  game,
  favorite,
  upNextHref,
  rail,
  children,
}: {
  game: PlayGame;
  favorite: StoredFavorite;
  upNextHref: string;
  rail: ReactNode;
  children: ReactNode;
}) {
  const [theatre, setTheatre] = useState(false);
  return (
    <div className="game-layout" data-theatre={theatre ? 'true' : 'false'}>
      <div className="min-w-0">
        <Player
          game={game}
          favorite={favorite}
          upNextHref={upNextHref}
          theatre={theatre}
          onTheatre={() => setTheatre((value) => !value)}
        />
        {children}
      </div>
      <aside className="play-rail" aria-label="Play next">
        <h2 className="text-title text-ink">Play next</h2>
        <div className="mt-3 grid gap-3">{rail}</div>
        <div className="frame-gap" />
        <AdSlot minHeight={250} minWidth={250} />
      </aside>
    </div>
  );
}
