'use client';

import { useEffect, useRef, useState } from 'react';
import { useSiteIcons } from '@/components/icons/IconProvider';
import { SITE_NAME } from '@/config/site';

export function TopBar({ preview = false }: { preview?: boolean }) {
  const icons = useSiteIcons();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (preview) return;
    let cancel = false;
    let unbind = () => {};
    const start = () => {
      void import('./bind-search-shortcut').then((mod) => {
        if (!cancel) unbind = mod.bindSearchShortcut();
      });
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start);
      return () => {
        cancel = true;
        window.cancelIdleCallback(id);
        unbind();
      };
    }
    const timer = window.setTimeout(start, 200);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
      unbind();
    };
  }, [preview]);

  useEffect(() => {
    if (preview) return;
    let last = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      if (!mobile) setHidden(false);
      else if (y > last && y > 64) setHidden(true);
      else setHidden(false);
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [preview]);

  return (
    <header
      className="top-bar flex items-center gap-3 px-4"
      data-preview={preview ? 'static' : undefined}
      data-hidden={hidden ? 'true' : 'false'}
    >
      <a href="/" className="font-display text-display-xs text-ink">
        {SITE_NAME}
      </a>
      <a
        href="/search/"
        aria-label="Search"
        className="press ml-auto inline-flex h-tap w-tap items-center justify-center rounded-button text-ink lg:hidden"
      >
        {icons.search}
      </a>
      <form action="/search/" method="get" className="ml-auto hidden min-w-0 flex-1 lg:block">
        <div className="relative flex min-h-tap w-full items-center rounded-input border border-edge bg-night">
          <label className="sr-only" htmlFor="top-search">
            Search games
          </label>
          <input
            id="top-search"
            ref={inputRef}
            data-top-search=""
            name="q"
            value={query}
            placeholder="Search games"
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-tap w-full bg-transparent px-3 text-ink outline-none placeholder:text-ink-muted"
          />
          <kbd className="mr-2 hidden text-ui text-ink-muted lg:inline" aria-hidden="true">
            /
          </kbd>
          {query.length > 0 ? (
            <button
              type="button"
              className="press mr-1 inline-flex h-tap w-tap items-center justify-center text-ink"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              {icons.clear}
            </button>
          ) : null}
        </div>
      </form>
      <a
        href="/my-games/"
        className="hidden min-h-tap items-center px-2 text-ink lg:inline-flex"
      >
        My games
      </a>
    </header>
  );
}
