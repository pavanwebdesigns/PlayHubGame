import Link from 'next/link';

const LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy/', label: 'Privacy policy' },
  { href: '/cookies/', label: 'Cookies' },
  { href: '/terms/', label: 'Terms' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="min-h-11 px-3 py-2 text-ink-muted"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-6 text-ink-muted">
        Free browser games, embedded from GamePix. No download and no account.
      </p>
    </footer>
  );
}
