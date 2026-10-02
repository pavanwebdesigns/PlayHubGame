import Link from 'next/link';
import { SITE_NAME } from '@/config/site';

const LINKS = [
  { href: '/new/', label: 'New' },
  { href: '/search/', label: 'Search' },
  { href: '/my-games/', label: 'My games' },
  { href: '/originals/reaction-time-test/', label: 'Reaction Time Test' },
  { href: '/originals/cps-test/', label: 'CPS Test' },
] as const;

export function SiteHeader() {
  return (
    <header className="bg-deck">
      <nav
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3"
        aria-label="Main"
      >
        <Link
          href="/"
          className="min-h-11 px-3 py-2 text-lg font-medium text-ink"
        >
          {SITE_NAME}
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="min-h-11 rounded-full px-3 py-2 text-ink-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
