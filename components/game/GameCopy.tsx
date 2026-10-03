import { ContentBlocks } from '@/components/content/ContentBlocks';
import { GameTile } from '@/components/game/GameTile';
import { COLLECTIONS } from '@/config/collections';
import { HUB_NAMES } from '@/config/taxonomy';
import type { GameRecord } from '@/lib/catalog/types';
import { buildToday } from '@/lib/build-clock';
import { loadContent } from '@/lib/content';
import { formatDay, orientationLabel } from '@/lib/format';
import type { TileGame } from '@/lib/tile-game';
import type { ReactNode } from 'react';

export function GameCopy({
  game,
  similar,
  upNext,
}: {
  game: GameRecord;
  similar: readonly TileGame[];
  upNext: ReactNode;
}) {
  const doc = loadContent('games', game.slug);
  const now = buildToday();
  const collections = COLLECTIONS.filter((item) => item.matches(game, now));
  const oneThumb = game.orientation === 'portrait' || game.orientation === 'all';
  return (
    <div className="mt-6">
      <h1 className="text-display-sm text-ink">{game.title}</h1>
      <p className="mt-2 text-ink-muted">
        <a href={`/category/${game.hub}/`} className="text-play underline">
          {HUB_NAMES[game.hub]}
        </a>
        <span aria-hidden="true"> · </span>
        {oneThumb ? (
          <a href="/collection/one-thumb/" className="text-play underline">
            One-thumb
          </a>
        ) : (
          'Wide screen'
        )}
      </p>
      {upNext}
      <div className="frame-gap" />
      {doc ? <ContentBlocks blocks={doc.blocks} /> : null}
      <section className="mt-6">
        <h2 className="text-title text-ink">Details</h2>
        <dl className="mt-3 grid gap-2 text-ink">
          <div>
            <dt className="text-ink-muted">Category</dt>
            <dd>
              <a href={`/category/${game.hub}/`} className="text-play">
                {HUB_NAMES[game.hub]}
              </a>
            </dd>
          </div>
          {collections.length > 0 ? (
            <div>
              <dt className="text-ink-muted">Collections</dt>
              <dd>
                {collections.map((item, index) => (
                  <span key={item.slug}>
                    {index > 0 ? <span aria-hidden="true"> · </span> : null}
                    <a href={`/collection/${item.slug}/`} className="text-play">
                      {item.name}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-ink-muted">Orientation</dt>
            <dd>{orientationLabel(game.orientation)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Added</dt>
            <dd>
              <time dateTime={game.publishedAt}>{formatDay(game.publishedAt)}</time>
            </dd>
          </div>
          {game.updatedAt && game.updatedAt !== game.publishedAt ? (
            <div>
              <dt className="text-ink-muted">Updated</dt>
              <dd>
                <time dateTime={game.updatedAt}>{formatDay(game.updatedAt)}</time>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
      {!doc && game.publisherDescription ? (
        <figure className="mt-6 max-w-prose">
          <blockquote className="text-ink">{game.publisherDescription}</blockquote>
          <figcaption className="mt-2 text-ink-muted">From the publisher</figcaption>
        </figure>
      ) : null}
      {similar.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-title text-ink">Similar games</h2>
          <div className="tile-grid">
            {similar.map((item, index) => (
              <GameTile key={item.slug} game={item} size="md" source="play_next" position={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
