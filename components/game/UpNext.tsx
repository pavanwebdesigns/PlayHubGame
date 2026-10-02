'use client';

import { useSyncExternalStore } from 'react';
import { GameTile } from '@/components/game/GameTile';
import { parseRecent, readRecentSnapshot, subscribeRecent } from '@/lib/recent';
import type { TileGame } from '@/lib/tile-game';

export function UpNext({ candidates }: { candidates: readonly TileGame[] }) {
  const raw = useSyncExternalStore(subscribeRecent, readRecentSnapshot, () => null);
  const played = new Set(parseRecent(raw).map((entry) => entry.slug));
  const game = candidates.find((item) => !played.has(item.slug)) ?? candidates[0];
  if (!game) return null;
  return (
    <section className="up-next">
      <h2 className="mb-3 text-title text-ink">Up next</h2>
      <div className="max-w-xs">
        <GameTile game={game} size="md" />
      </div>
    </section>
  );
}
