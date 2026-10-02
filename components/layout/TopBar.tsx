'use client';

import { Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { SearchField } from '@/components/ui/SearchField';
import { SITE_NAME } from '@/config/site';

export function TopBar({ preview = false }: { preview?: boolean }) {
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(false);

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    window.location.assign(
      next ? `/search/?q=${encodeURIComponent(next)}` : '/search/',
    );
  }

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
        <Search aria-hidden="true" size={20} />
      </a>
      <form
        onSubmit={onSubmit}
        className="ml-auto hidden min-w-0 flex-1 lg:block"
      >
        <SearchField value={query} onValueChange={setQuery} />
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
