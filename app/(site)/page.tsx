import { GameLinks } from '@/components/game/GameLinks';
import { HUB_NAMES, type HubSlug } from '@/config/taxonomy';
import { visibleCollections } from '@/config/collections';
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/config/site';
import { buildToday } from '@/lib/build-clock';
import { loadCurated } from '@/lib/catalog/load';

export default function HomePage() {
  const games = loadCurated();
  const now = buildToday();
  const collections = visibleCollections(games, now);
  const hubs = (Object.entries(HUB_NAMES) as [HubSlug, string][]).filter(
    ([slug]) => games.some((game) => game.hub === slug),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-4xl text-ink">{SITE_NAME}</h1>
      <p className="mt-3 max-w-prose text-ink-muted">{DEFAULT_DESCRIPTION}</p>
      <section className="mt-8">
        <h2 className="mb-3 text-2xl text-ink">Top games</h2>
        <GameLinks games={games.slice(0, 24)} />
      </section>
      {collections.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-2xl text-ink">Collections</h2>
          <ul className="flex flex-wrap gap-2">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <a
                  href={`/collection/${collection.slug}/`}
                  className="inline-flex min-h-11 items-center rounded-full bg-deck px-4 text-ink"
                >
                  {collection.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="mb-3 text-2xl text-ink">Categories</h2>
        <ul className="flex flex-wrap gap-2">
          {hubs.map(([slug, name]) => (
            <li key={slug}>
              <a
                href={`/category/${slug}/`}
                className="inline-flex min-h-11 items-center rounded-full bg-deck px-4 text-ink"
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
