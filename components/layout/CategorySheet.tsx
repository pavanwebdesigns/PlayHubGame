'use client';

import { Sheet } from '@/components/ui/Sheet';

type NavLink = { href: string; label: string };

export function CategorySheet({
  open,
  onClose,
  categories,
  collections,
}: {
  open: boolean;
  onClose: () => void;
  categories: readonly NavLink[];
  collections: readonly NavLink[];
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Categories">
      <ul className="grid gap-2">
        {categories.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="inline-flex min-h-tap items-center text-ink">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-lead text-ink">Collections</h3>
      <ul className="mt-2 grid gap-2">
        {collections.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="inline-flex min-h-tap items-center text-ink">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
