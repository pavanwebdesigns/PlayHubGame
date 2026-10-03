'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Row } from '@/components/game/Row';
import { useSiteIcons } from '@/components/icons/IconProvider';
import { SearchField } from '@/components/ui/SearchField';
import type { SearchIndexEntry } from '@/lib/catalog/types';
import { mergeSearch, readSearches, readSearchesSnapshot, subscribeSearches, writeSearches } from '@/lib/searches';
import type { TileGame } from '@/lib/tile-game';
import { z } from 'zod';

const rowSchema = z.object({
  slug: z.string(),
  title: z.string(),
  hub: z.string(),
  tags: z.array(z.string()),
});

type Engine = { search: (query: string) => SearchIndexEntry[] };

function highlight(text: string, query: string) {
  const needle = query.trim();
  if (!needle) return text;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

async function loadEngine(): Promise<Engine> {
  const [{ default: MiniSearch }, response] = await Promise.all([
    import('minisearch'),
    fetch('/data/search-index.json'),
  ]);
  if (!response.ok) throw new Error(`Search index returned ${response.status}`);
  const parsed = z.array(rowSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error('Search index was not valid');
  const mini = new MiniSearch<SearchIndexEntry>({
    fields: ['title', 'hub', 'tags'],
    storeFields: ['slug', 'title', 'hub', 'tags'],
    idField: 'slug',
  });
  mini.addAll(parsed.data as SearchIndexEntry[]);
  return {
    search: (query: string) => mini.search(query) as unknown as SearchIndexEntry[],
  };
}

export function SearchBox({
  hubs,
  picks,
}: {
  hubs: readonly { href: string; label: string }[];
  picks: readonly TileGame[];
}) {
  const icons = useSiteIcons();
  const [results, setResults] = useState<SearchIndexEntry[]>([]);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  const engine = useRef<Engine | null>(null);
  const fromUrl = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get('q') ?? '',
    () => '',
  );
  const recentKey = useSyncExternalStore(
    subscribeSearches,
    readSearchesSnapshot,
    () => '',
  );
  const [override, setOverride] = useState<string | null>(null);
  const query = override ?? fromUrl;
  const recent = recentKey.length > 0 ? recentKey.split('\u0000') : [];

  useEffect(() => {
    let cancelled = false;
    loadEngine()
      .then((next) => {
        if (cancelled) return;
        engine.current = next;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('Search did not load. Check your connection and try again.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      const url = trimmed ? `/search/?q=${encodeURIComponent(trimmed)}` : '/search/';
      window.history.replaceState(null, '', url);
      if (!trimmed || !engine.current) {
        setResults([]);
        if (!trimmed) setStatus('');
        return;
      }
      const found = engine.current.search(trimmed).slice(0, 24);
      setResults(found);
      setActive(0);
      setStatus(found.length === 0 ? 'No games match that search.' : '');
      const nextRecent = mergeSearch(readSearches(), trimmed);
      writeSearches(nextRecent);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [query, ready]);

  const showMiss = status.startsWith('No games') && query.trim().length > 0;

  return (
    <div>
      <SearchField
        value={query}
        onValueChange={setOverride}
        status={status}
        aria-activedescendant={results[active] ? `search-${results[active].slug}` : undefined}
        aria-controls="search-results"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((index) => Math.min(results.length - 1, index + 1));
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => Math.max(0, index - 1));
          }
            const chosen = results[active];
            if (event.key === 'Enter' && chosen) {
              event.preventDefault();
              document.getElementById(`search-${chosen.slug}`)?.click();
            }
        }}
      />
      {query.trim().length === 0 && recent.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-title text-ink">Recent searches</h2>
            <button
              type="button"
              className="inline-flex min-h-tap items-center text-play"
              onClick={() => {
                writeSearches([]);
              }}
            >
              Clear
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recent.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="inline-flex min-h-tap items-center rounded-button bg-deck px-4 text-ink"
                  onClick={() => setOverride(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul
        id="search-results"
        role="listbox"
        aria-label="Search results"
        className="mt-4 grid gap-2"
      >
        {results.map((game, index) => (
          <li key={game.slug} role="option" aria-selected={index === active}>
            <a
              id={`search-${game.slug}`}
              href={`/game/${game.slug}/`}
              className={`inline-flex min-h-tap items-center text-ink ${index === active ? 'text-play' : ''}`}
            >
              {highlight(game.title, query)}
            </a>
          </li>
        ))}
      </ul>
      {showMiss ? (
        <div className="mt-6 grid gap-4">
          <h2 className="text-title text-ink">Try a category</h2>
          <ul className="flex flex-wrap gap-2">
            {hubs.map((hub) => (
              <li key={hub.href}>
                <a href={hub.href} className="inline-flex min-h-tap items-center rounded-button bg-deck px-4 text-ink">
                  {hub.label}
                </a>
              </li>
            ))}
          </ul>
          {picks.length > 0 ? (
            <Row
              title="Today’s picks"
              href="/"
              games={picks}
              previous={icons.previous}
              next={icons.next}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
