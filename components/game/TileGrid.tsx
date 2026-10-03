import { GameTile } from '@/components/game/GameTile';
import { tileHiddenClasses, type TileColumns } from '@/lib/tile-pack';
import type { TileGame } from '@/lib/tile-game';

export type { TileColumns };

export function TileGrid({
  tiles,
  columns,
}: {
  tiles: readonly { game: TileGame; size: 'xl' | 'md' }[];
  columns?: TileColumns;
}) {
  const hiddenByIndex = tileHiddenClasses(tiles);

  return (
    <div className="tile-grid" data-columns={columns}>
      {tiles.map((tile, index) => {
        const hidden = hiddenByIndex[index] ?? '';
        return (
          <GameTile
            key={`${tile.size}-${tile.game.slug}-${index}`}
            game={tile.game}
            size={tile.size}
            className={hidden}
          />
        );
      })}
    </div>
  );
}
