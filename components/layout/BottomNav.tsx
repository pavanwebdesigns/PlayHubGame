'use client';

import { House, LayoutGrid, Search, Heart } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { Sheet } from '@/components/ui/Sheet';

type NavLink = { href: string; label: string };

const items = [
  { id: 'home', href: '/', label: 'Home', icon: House },
  { id: 'search', href: '/search/', label: 'Search', icon: Search },
  { id: 'my-games', href: '/my-games/', label: 'My games', icon: Heart },
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
  const [open, setOpen] = useState(false);
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
          <House
            aria-hidden="true"
            size={20}
            className={current === 'home' ? 'fill-ink' : undefined}
          />
          <span className={current === 'home' ? 'font-semibold' : 'font-normal'}>
            Home
          </span>
        </a>
        <button
          type="button"
          className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <LayoutGrid aria-hidden="true" size={20} />
          <span className="font-normal">Categories</span>
        </button>
        {items.slice(1).map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={current === item.id ? 'page' : undefined}
            className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
          >
            <item.icon
              aria-hidden="true"
              size={20}
              className={current === item.id ? 'fill-ink' : undefined}
            />
            <span
              className={current === item.id ? 'font-semibold' : 'font-normal'}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} title="Categories">
        <ul className="grid gap-2">
          {categories.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex min-h-tap items-center text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mt-4 text-lead text-ink">Collections</h3>
        <ul className="mt-2 grid gap-2">
          {collections.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex min-h-tap items-center text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
