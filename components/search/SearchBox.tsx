'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SearchIndexEntry } from '@/lib/catalog/types';

type MiniSearchInstance = {
  search: (query: string) => SearchIndexEntry[];
};

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const [results, setResults] = useState<SearchIndexEntry[]>([]);
  const [status, setStatus] = useState('');
  const engine = useState<{ current: MiniSearchInstance | null }>({
    current: null,
  })[0];

  async function run(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResults([]);
      setStatus('');
      return;
    }
    try {
      let current = engine.current;
      if (!current) {
        const [{ default: MiniSearch }, response] = await Promise.all([
          import('minisearch'),
          fetch('/data/search-index.json'),
        ]);
        if (!response.ok)
          throw new Error(`Search index returned ${response.status}`);
        const rows = (await response.json()) as SearchIndexEntry[];
        const mini = new MiniSearch<SearchIndexEntry>({
          fields: ['title', 'hub', 'tags'],
          storeFields: ['slug', 'title', 'hub', 'tags'],
          idField: 'slug',
        });
        mini.addAll(rows);
        current = {
          search: (query: string) =>
            mini.search(query) as unknown as SearchIndexEntry[],
        };
        engine.current = current;
      }
      const found = current.search(trimmed).slice(0, 50);
      setResults(found);
      setStatus(found.length === 0 ? 'No games match that search.' : '');
    } catch {
      setStatus('Search did not load. Check your connection and try again.');
    }
  }

  useEffect(() => {
    // Static export has no request, so a shared ?q= link is read after hydration.
    const fromUrl =
      new URLSearchParams(window.location.search).get('q') ?? initialQuery;
    if (!fromUrl) return;
    void run(fromUrl);
    // Run once for the URL. Later searches go through the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = data.get('q');
        void run(typeof value === 'string' ? value : '');
      }}
    >
      <label className="block text-ink" htmlFor="search-q">
        Search games
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="search-q"
          name="q"
          defaultValue={initialQuery}
          className="min-h-11 min-w-0 flex-1 rounded-input border border-edge bg-deck px-3 text-ink"
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-play px-5 text-night"
        >
          Search
        </button>
      </div>
      {status ? <p className="mt-4 text-ink-muted">{status}</p> : null}
      <ul className="mt-4 grid gap-3">
        {results.map((game) => (
          <li key={game.slug}>
            <Link
              href={`/game/${game.slug}/`}
              className="min-h-11 inline-flex items-center text-play"
            >
              {game.title}
            </Link>
          </li>
        ))}
      </ul>
    </form>
  );
}
