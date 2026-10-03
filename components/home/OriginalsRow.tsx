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
            className="tile"
          >
            <span className="tile-cover">
              <span className="cover-frame">
                <span className="cover-fallback">
                  <span className="cover-title">{item.title}</span>
                </span>
              </span>
            </span>
            <span className="tile-title">{item.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
