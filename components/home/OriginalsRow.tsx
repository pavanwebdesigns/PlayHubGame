const ORIGINALS = [
  { href: '/originals/cps-test/', title: 'CPS test' },
  { href: '/originals/reaction-time-test/', title: 'Reaction time test' },
] as const;

export function OriginalsRow() {
  return (
    <section>
      <h2 className="mb-3 text-title text-ink">PlayHub Originals</h2>
      <div className="grid max-w-md grid-cols-2 gap-4">
        {ORIGINALS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="game-tile block rounded-tile"
          >
            <span className="tile-media relative block overflow-hidden rounded-tile">
              <span className="cover-frame">
                <span className="cover-fallback">
                  <span className="cover-title line-clamp-2 text-ink">
                    {item.title}
                  </span>
                </span>
              </span>
            </span>
            <span className="mt-1 block truncate text-ink">{item.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
