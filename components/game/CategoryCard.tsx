import type { LucideIcon } from 'lucide-react';

export function CategoryCard({
  href,
  icon: Icon,
  name,
  count,
}: {
  href: string;
  icon: LucideIcon;
  name: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className="press flex min-h-tap items-center gap-3 rounded-tile bg-deck px-3 py-2 text-ink"
    >
      <Icon aria-hidden="true" size={20} />
      <span className="font-medium">{name}</span>
      <span className="text-ink-muted">{count}</span>
    </a>
  );
}
