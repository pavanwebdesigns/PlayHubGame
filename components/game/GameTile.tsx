import type { CSSProperties } from 'react';
import { HUB_NAMES } from '@/config/taxonomy';
import { buildToday } from '@/lib/build-clock';
import { isNewGame, type TileGame } from '@/lib/tile-game';
import { CoverImage } from '@/components/game/CoverImage';
import { Icon } from '@/components/icons/glyphs';
import { ROW_SIZES, TILE_SIZES, TILE_WIDTHS, XL_SIZES } from '@/lib/cover-sizes';

const sizeClass = {
  xl: 'tile-xl',
  md: '',
  row: 'tile-row',
} as const;

export function GameTile({
  game,
  size,
  className,
  span = true,
  sizes,
  style,
}: {
  game: TileGame;
  size: keyof typeof sizeClass;
  className?: string;
  /** When false, the caller supplies the span class so it can change by breakpoint. */
  span?: boolean;
  sizes?: string;
  style?: CSSProperties;
}) {
  const isNew = isNewGame(game.publishedAt, buildToday());
  const spanClass = span ? sizeClass[size] : '';

  const frame = `${spanClass}${className ? ` ${className}` : ''}`.trim();

  return (
    <div className={`relative ${frame}`} style={style}>
      <a
        href={`/game/${game.slug}/`}
        className="game-tile relative block rounded-tile"
        data-orientation={game.orientation}
      >
        <span
          className={`tile-media relative block overflow-hidden rounded-tile${isNew ? ' tile-media-new' : ''}`}
        >
          <CoverImage
            src={game.cover}
            alt={game.title}
            title={game.title}
            coverWidth={game.coverWidth}
            widths={TILE_WIDTHS}
            sizes={
              sizes ??
              (size === 'row' ? ROW_SIZES : size === 'xl' ? XL_SIZES : TILE_SIZES)
            }
          />
          {isNew ? (
            <span className="tile-new absolute top-2 left-2 inline-flex items-center gap-1 rounded-button bg-night px-2 text-ui text-spark">
              <span
                className="size-2 rounded-button bg-spark"
                aria-hidden="true"
              />
              New
            </span>
          ) : null}
          <span
            className="tile-hub absolute inset-x-0 bottom-0 bg-night px-2 py-1 text-ui text-ink"
            aria-hidden="true"
          >
            {HUB_NAMES[game.hub]}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="mt-1 block truncate text-ink"
          title={game.title}
        >
          {game.title}
        </span>
      </a>
      <button
        type="button"
        className="save-game absolute top-1 right-1 z-10 inline-flex h-tap w-tap items-center justify-center rounded-button bg-night text-ink"
        data-save={game.slug}
        data-id={game.id}
        data-title={game.title}
        data-orientation={game.orientation}
        aria-pressed="false"
        aria-label={`Save ${game.title}`}
      >
        <Icon name="heart" />
      </button>
    </div>
  );
}
