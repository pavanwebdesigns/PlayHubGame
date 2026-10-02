'use client';

import { useState, useSyncExternalStore, type ComponentType } from 'react';
import { useSiteIcons } from '@/components/icons/IconProvider';
import type { CategorySheet } from '@/components/layout/CategorySheet';

type NavLink = { href: string; label: string };

const items = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'search', href: '/search/', label: 'Search' },
  { id: 'my-games', href: '/my-games/', label: 'My games' },
] as const;

function subscribePath(listener: () => void): () => void {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}

function currentPath(): string {
  return window.location.pathname;
}

export function BottomNav({
  active,
  categories,
  collections,
  preview = false,
}: {
  active?: 'home' | 'search' | 'my-games';
  categories: readonly NavLink[];
  collections: readonly NavLink[];
  preview?: boolean;
}) {
  const icons = useSiteIcons();
  const [open, setOpen] = useState(false);
  const [Panel, setPanel] = useState<ComponentType<
    Parameters<typeof CategorySheet>[0]
  > | null>(null);

  function openCategories() {
    setOpen(true);
    if (Panel) return;
    void import('./CategorySheet').then((mod) => setPanel(() => mod.CategorySheet));
  }
  const path = useSyncExternalStore(subscribePath, currentPath, () => '');
  const current =
    active ??
    (path === '/'
      ? 'home'
      : path.startsWith('/search')
        ? 'search'
        : path.startsWith('/my-games')
          ? 'my-games'
          : undefined);

  return (
    <>
      <nav
        className="bottom-nav"
        data-preview={preview ? 'mobile' : undefined}
        aria-label="Primary"
      >
        <a
          href="/"
          aria-current={current === 'home' ? 'page' : undefined}
          className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
        >
          <span className={current === 'home' ? '[&_svg]:fill-ink' : undefined}>
            {icons.house}
          </span>
          <span className={current === 'home' ? 'font-semibold' : 'font-normal'}>
            Home
          </span>
        </a>
        <button
          type="button"
          className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
          aria-expanded={open}
          onClick={openCategories}
        >
          {icons.categories}
          <span className="font-normal">Categories</span>
        </button>
        {items.slice(1).map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={current === item.id ? 'page' : undefined}
            className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
          >
            <span className={current === item.id ? '[&_svg]:fill-ink' : undefined}>
              {item.id === 'search' ? icons.search : icons.heart}
            </span>
            <span
              className={current === item.id ? 'font-semibold' : 'font-normal'}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>
      {Panel ? (
        <Panel
          open={open}
          onClose={() => setOpen(false)}
          categories={categories}
          collections={collections}
        />
      ) : null}
    </>
  );
}
