import { HUB_NAMES } from '@/config/taxonomy';
import { buildToday } from '@/lib/build-clock';
import { isNewGame, type TileGame } from '@/lib/tile-game';
import { CoverImage } from '@/components/game/CoverImage';
import { FavoriteMark } from '@/components/game/FavoriteMark';

const sizeClass = {
  xl: 'tile-xl',
  md: '',
  row: 'tile-row',
} as const;

export function GameTile({
  game,
  size,
}: {
  game: TileGame;
  size: keyof typeof sizeClass;
}) {
  const isNew = isNewGame(game.publishedAt, buildToday());

  return (
    <a
      href={`/game/${game.slug}/`}
      className={`game-tile relative block rounded-tile ${sizeClass[size]}`}
      data-orientation={game.orientation}
    >
      <span className="relative block overflow-hidden rounded-tile">
        <CoverImage
          src={game.cover}
          alt={game.title}
          title={game.title}
          sizes="(max-width: 768px) 50vw, 16vw"
        />
        <span className="absolute top-1 right-1">
          <FavoriteMark slug={game.slug} />
        </span>
        {isNew ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-button bg-night px-2 text-ui text-spark">
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
