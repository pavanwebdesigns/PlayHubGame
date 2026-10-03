import type { ReactNode } from 'react';

export function CategoryCard({
  href,
  icon,
  name,
  count,
}: {
  href: string;
  icon: ReactNode;
  name: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className="category-card press flex min-h-16 max-w-xs items-center gap-3 rounded-tile bg-deck px-4 text-ink"
    >
      {icon}
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        <span className="block text-ui text-ink-muted">{count} games</span>
      </span>
    </a>
  );
}
