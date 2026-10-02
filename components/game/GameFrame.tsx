'use client';

import Image from 'next/image';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  favoriteFromGame,
  readFavorites,
  writeFavorites,
  FAVORITES_KEY,
} from '@/lib/favorites';
import type { GameRecord } from '@/lib/catalog/types';

function readRaw(): string | null {
  try {
    return localStorage.getItem(FAVORITES_KEY);
  } catch {
    return null;
  }
}

export function GameFrame({ game }: { game: GameRecord }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const stored = useSyncExternalStore(
    () => () => {},
    readRaw,
    () => null,
  );
  const saved =
    override ?? readFavorites(stored).some((item) => item.id === game.id);

  function toggleSave() {
    const current = readFavorites(readRaw());
    const exists = current.some((item) => item.id === game.id);
    const next = exists
      ? current.filter((item) => item.id !== game.id)
      : [...current, favoriteFromGame(game)];
    writeFavorites(next);
    setOverride(!exists);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-play px-5 text-night"
          onClick={() => setPlaying(true)}
        >
          Play
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-raised px-5 text-ink"
          onClick={toggleSave}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-raised px-5 text-ink"
          onClick={() => {
            frameRef.current?.requestFullscreen?.().catch(() => {
              // Some browsers refuse fullscreen without a gesture or outside a secure context.
            });
          }}
        >
          Full screen
        </button>
      </div>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-tile bg-deck"
        style={{ aspectRatio: '1.6' }}
      >
        {playing ? (
          <iframe
            title={game.title}
            src={game.embedUrl}
            className="h-full w-full border-0"
            allow="fullscreen; autoplay; gamepad; accelerometer; gyroscope"
          />
        ) : (
          <Image
            src={game.cover}
            alt=""
            width={640}
            height={400}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
