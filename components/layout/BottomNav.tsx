'use client';

import { House, LayoutGrid, Search, Heart } from 'lucide-react';
import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';

type NavLink = { href: string; label: string };

const items = [
  { id: 'home', href: '/', label: 'Home', icon: House },
  { id: 'search', href: '/search/', label: 'Search', icon: Search },
  { id: 'my-games', href: '/my-games/', label: 'My games', icon: Heart },
] as const;

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

  return (
    <>
      <nav
        className="bottom-nav"
        data-preview={preview ? 'mobile' : undefined}
        aria-label="Primary"
      >
        <a
          href="/"
          aria-current={active === 'home' ? 'page' : undefined}
          className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
        >
          <House
            aria-hidden="true"
            size={20}
            className={active === 'home' ? 'fill-ink' : undefined}
          />
          <span className={active === 'home' ? 'font-semibold' : 'font-normal'}>
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
            aria-current={active === item.id ? 'page' : undefined}
            className="flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-ui text-ink"
          >
            <item.icon
              aria-hidden="true"
              size={20}
              className={active === item.id ? 'fill-ink' : undefined}
            />
            <span
              className={active === item.id ? 'font-semibold' : 'font-normal'}
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
