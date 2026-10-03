import { HUB_NAMES } from '@/config/taxonomy';
import { buildToday } from '@/lib/build-clock';
import { isNewGame, type TileGame } from '@/lib/tile-game';
import { CoverImage } from '@/components/game/CoverImage';
import { FavoriteMark } from '@/components/game/FavoriteMark';
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
}: {
  game: TileGame;
  size: keyof typeof sizeClass;
  className?: string;
}) {
  const isNew = isNewGame(game.publishedAt, buildToday());

  return (
    <a
      href={`/game/${game.slug}/`}
      className={`game-tile relative block rounded-tile ${sizeClass[size]}${className ? ` ${className}` : ''}`}
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
          sizes={size === 'row' ? ROW_SIZES : size === 'xl' ? XL_SIZES : TILE_SIZES}
        />
        <span className="absolute top-1 right-1">
          <FavoriteMark slug={game.slug} />
        </span>
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
  );
}
