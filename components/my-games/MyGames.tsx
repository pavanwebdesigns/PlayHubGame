'use client';

import { useState, useSyncExternalStore } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { buttonClass } from '@/components/ui/Button';
import {
  readFavorites,
  readFavoritesSnapshot,
  subscribeFavorites,
} from '@/lib/favorites';
import {
  clearRecent,
  parseRecent,
  readRecentSnapshot,
  subscribeRecent,
} from '@/lib/recent';
import { getTileMap, subscribeTileMap } from '@/lib/tile-lookup';

export function MyGames() {
  const [tab, setTab] = useState<'saved' | 'recent'>('saved');
  const [confirm, setConfirm] = useState(false);
  const favoritesRaw = useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    () => null,
  );
  const recentRaw = useSyncExternalStore(subscribeRecent, readRecentSnapshot, () => null);
  const tiles = useSyncExternalStore(subscribeTileMap, getTileMap, () => null);
  const favorites = readFavorites(favoritesRaw);
  const recent = parseRecent(recentRaw);

  return (
    <div>
      <div className="flex gap-2" role="tablist" aria-label="My games">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'saved'}
          className={buttonClass(tab === 'saved' ? 'play' : 'secondary')}
          onClick={() => setTab('saved')}
        >
          Saved
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'recent'}
          className={buttonClass(tab === 'recent' ? 'play' : 'secondary')}
          onClick={() => setTab('recent')}
        >
          Recently played
        </button>
      </div>
      {tab === 'saved' ? (
        <div className="mt-4" role="tabpanel">
          {favoritesRaw === null || favorites.length === 0 ? (
            <p className="text-ink">
              Games you save show up here.{' '}
              <a href="/" className="text-play underline">
                Start with today’s picks.
              </a>
            </p>
          ) : (
            <ul className="grid gap-4">
              {favorites.map((game) => {
                const slug = game.namespace;
                const known = Boolean(slug && tiles?.has(slug));
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
                      {known && slug ? (
                        <a
                          href={`/game/${slug}/`}
                          className="mt-2 inline-flex min-h-tap items-center text-play"
                        >
                          Play
                        </a>
                      ) : (
                        <a
                          href={`/search/?q=${encodeURIComponent(game.title)}`}
                          className="mt-2 inline-flex min-h-tap items-center text-play"
                        >
                          Find similar
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4" role="tabpanel">
          {recent.length === 0 ? (
            <p className="text-ink">
              Games you play show up here.{' '}
              <a href="/" className="text-play underline">
                Start with today’s picks.
              </a>
            </p>
          ) : (
            <ul className="grid gap-3">
              {recent.map((entry) => {
                const tile = tiles?.get(entry.slug);
                return (
                  <li key={entry.slug}>
                    <a
                      href={`/game/${entry.slug}/`}
                      className="inline-flex min-h-tap items-center text-ink"
                    >
                      {tile?.title ?? entry.slug}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            className={`${buttonClass('secondary')} mt-4`}
            onClick={() => setConfirm(true)}
          >
            Clear history
          </button>
          <Dialog open={confirm} onClose={() => setConfirm(false)} title="Clear history?">
            <p className="text-ink">
              This removes recently played games from this browser.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={buttonClass('play')}
                onClick={() => {
                  clearRecent();
                  setConfirm(false);
                }}
              >
                Clear history
              </button>
              <button
                type="button"
                className={buttonClass('secondary')}
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </Dialog>
        </div>
      )}
    </div>
  );
}
