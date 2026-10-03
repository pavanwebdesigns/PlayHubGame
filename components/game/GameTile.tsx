import type { CSSProperties } from 'react';
import { HUB_NAMES } from '@/config/taxonomy';
import { buildToday } from '@/lib/build-clock';
import { isNewGame, type TileGame } from '@/lib/tile-game';
import { CoverImage } from '@/components/game/CoverImage';
import { Icon } from '@/components/icons/Icon';
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
  source,
  position,
  positionWide,
}: {
  game: TileGame;
  size: keyof typeof sizeClass;
  className?: string;
  /** When false, the caller supplies the span class so it can change by breakpoint. */
  span?: boolean;
  sizes?: string;
  style?: CSSProperties;
  source?: string;
  position?: number;
  positionWide?: number;
}) {
  const isNew = isNewGame(game.publishedAt, buildToday());
  const spanClass = span ? sizeClass[size] : '';

  const frame = [spanClass, className].filter(Boolean).join(' ');

  return (
    <div className={frame ? `tile-slot ${frame}` : 'tile-slot'} style={style}>
      <a
        href={`/game/${game.slug}/`}
        className="tile"
        data-orientation={game.orientation}
        data-slug={source ? game.slug : undefined}
        data-source={source}
        data-position={position}
        {...(positionWide === undefined ? {} : { 'data-position-wide': positionWide })}
      >
        <span className={isNew ? 'tile-cover tile-cover-new' : 'tile-cover'}>
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
            <span className="tile-new">
              <span className="tile-new-dot" aria-hidden="true" />
              New
            </span>
          ) : null}
          <span className="tile-hub" aria-hidden="true">
            {HUB_NAMES[game.hub]}
          </span>
        </span>
        <span className="tile-title" title={game.title} aria-hidden="true">
          {game.title}
        </span>
      </a>
      <button
        type="button"
        className="tile-save"
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
