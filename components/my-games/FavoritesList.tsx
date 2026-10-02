'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import {
  readFavorites,
  readFavoritesSnapshot,
  subscribeFavorites,
} from '@/lib/favorites';

export function FavoritesList() {
  const raw = useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    () => null,
  );
  const idMap = useSyncExternalStore(subscribeIds, getIds, () => null);
  const favorites = readFavorites(raw);

  if (raw === null && idMap === null) {
    return <p className="text-ink-muted">Games you save show up here.</p>;
  }
  if (favorites.length === 0) {
    return <p className="text-ink-muted">Games you save show up here.</p>;
  }

  return (
    <ul className="grid gap-4">
      {favorites.map((game) => {
        const slug = idMap?.[game.id];
        return (
          <li key={game.id} className="flex gap-3 rounded-tile bg-deck p-3">
            {game.banner_image ? (
              // Saved covers already include their own size parameter.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.banner_image}
                alt=""
                width={160}
                height={100}
                className="h-16 w-24 rounded-input object-cover"
              />
            ) : null}
            <div>
              <p className="text-ink">{game.title}</p>
              {slug ? (
                <Link
                  href={`/game/${slug}/`}
                  className="mt-2 inline-flex min-h-11 items-center text-play"
                >
                  Play
                </Link>
              ) : (
                <Link
                  href={`/search/?q=${encodeURIComponent(game.title)}`}
                  className="mt-2 inline-flex min-h-11 items-center text-play"
                >
                  Find similar
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

let idsCache: Record<string, string> | null = null;
let idsPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function subscribeIds(listener: () => void) {
  listeners.add(listener);
  if (!idsPromise) {
    idsPromise = fetch('/data/legacy-ids.json')
      .then((response) => (response.ok ? response.json() : {}))
      .then((value: unknown) => {
        idsCache =
          value && typeof value === 'object'
            ? (value as Record<string, string>)
            : {};
        for (const notify of listeners) notify();
      })
      .catch(() => {
        idsCache = {};
        for (const notify of listeners) notify();
      });
  }
  return () => listeners.delete(listener);
}

function getIds() {
  return idsCache;
}
