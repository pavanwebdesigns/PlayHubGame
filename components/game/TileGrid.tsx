import { GameTile } from '@/components/game/GameTile';
import type { TileGame } from '@/lib/tile-game';

export const TILE_COLUMNS = [2, 3, 4, 6, 8] as const;
export type TileColumns = (typeof TILE_COLUMNS)[number];

export function TileGrid({
  tiles,
  columns,
}: {
  tiles: readonly { game: TileGame; size: 'xl' | 'md' }[];
  columns?: TileColumns;
}) {
  return (
    <div className="tile-grid" data-columns={columns}>
      {tiles.map((tile, index) => (
        <GameTile
          key={`${tile.size}-${tile.game.slug}-${index}`}
          game={tile.game}
          size={tile.size}
        />
      ))}
    </div>
  );
}
