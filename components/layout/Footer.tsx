const LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/cookies/', label: 'Cookies' },
  { href: '/terms/', label: 'Terms' },
  { href: '/contact/', label: 'Report a game' },
] as const;

export function Footer({
  year,
  hubs,
}: {
  year: number;
  hubs: readonly { href: string; label: string }[];
}) {
  return (
    <footer className="border-t border-line px-4 py-6">
      <nav aria-label="Categories" className="flex flex-wrap gap-2">
        {hubs.map((hub) => (
          <a
            key={hub.href}
            href={hub.href}
            className="inline-flex min-h-tap items-center px-2 text-ink-muted"
          >
            {hub.label}
          </a>
        ))}
      </nav>
      <nav aria-label="About this site" className="mt-2 flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="inline-flex min-h-tap items-center px-2 text-ink-muted"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <p className="mt-3 text-ink-muted">
        Most games on PlayHubPlace are provided by GamePix.
      </p>
      <p className="mt-1 text-ink-muted">© {year} PlayHubPlace</p>
    </footer>
  );
}
