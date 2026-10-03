import { ReadMore } from '@/components/content/ReadMore';
import { GameTile } from '@/components/game/GameTile';
import { JsonLd } from '@/components/seo/JsonLd';
import type { ContentDoc } from '@/lib/content';
import {
  listingPath,
  tagLabel,
  type ListingQuery,
  type ListingSort,
} from '@/lib/listing';
import { breadcrumbLd, collectionLd } from '@/lib/structured-data';
import type { TileGame } from '@/lib/tile-game';

function chipClass(current: boolean): string {
  return `press inline-flex min-h-tap items-center rounded-button border border-edge px-4 ${current ? 'bg-play text-night' : 'bg-deck text-ink'}`;
}

export function GameListing({
  title,
  intro,
  games,
  query,
  pages,
  base,
  defaultSort = 'popular',
  tags = [],
  crumbs,
}: {
  title: string;
  intro: ContentDoc | null;
  games: readonly TileGame[];
  query: ListingQuery;
  pages: number;
  base: string;
  defaultSort?: ListingSort;
  tags?: readonly string[];
  crumbs: readonly { href: string; label: string }[];
}) {
  const pathFor = (next: Partial<ListingQuery> & { page?: number }) =>
    listingPath(
      base,
      {
        sort: next.sort ?? query.sort,
        page: next.page ?? 1,
        tag: next.tag === '' ? undefined : (next.tag ?? query.tag),
      },
      defaultSort,
    );

  return (
    <main className="px-4 py-6">
      <link rel="preconnect" href="https://img.gamepix.com" />
      <nav aria-label="Breadcrumb" className="mb-4 text-ink-muted">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href}>
            {index > 0 ? <span aria-hidden="true"> › </span> : null}
            <a href={crumb.href} className="inline-flex min-h-tap items-center">
              {crumb.label}
            </a>
          </span>
        ))}
      </nav>
      <h1 className="text-display-sm text-ink">{title}</h1>
      {intro ? (
        <div className="mt-4">
          <ReadMore doc={intro} />
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Sort">
        <a
          href={pathFor({ sort: 'popular', page: 1 })}
          aria-current={query.sort === 'popular' ? 'page' : undefined}
          className={chipClass(query.sort === 'popular')}
        >
          Popular
        </a>
        <a
          href={pathFor({ sort: 'new', page: 1 })}
          aria-current={query.sort === 'new' ? 'page' : undefined}
          className={chipClass(query.sort === 'new')}
        >
          New
        </a>
      </div>
      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tags">
          <a
            href={pathFor({ tag: '', page: 1 })}
            aria-current={query.tag ? undefined : 'page'}
            className={chipClass(!query.tag)}
          >
            All
          </a>
          {tags.map((tag) => (
            <a
              key={tag}
              href={pathFor({ tag, page: 1, sort: query.sort })}
              aria-current={query.tag === tag ? 'page' : undefined}
              className={chipClass(query.tag === tag)}
            >
              {tagLabel(tag)}
            </a>
          ))}
        </div>
      ) : null}
      <div className="tile-grid mt-4">
        {games.map((game) => (
          <GameTile key={game.slug} game={game} size="md" />
        ))}
      </div>
      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: pages }, (_, index) => {
            const number = index + 1;
            return (
              <a
                key={number}
                href={pathFor({ page: number })}
                aria-current={number === query.page ? 'page' : undefined}
                className={chipClass(number === query.page)}
              >
                {number}
              </a>
            );
          })}
        </nav>
      ) : null}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            collectionLd({
              name: title,
              path: pathFor({ page: query.page }),
              games,
            }),
            breadcrumbLd(
              crumbs.map((crumb) => ({ name: crumb.label, path: crumb.href })),
            ),
          ],
        }}
      />
    </main>
  );
}
