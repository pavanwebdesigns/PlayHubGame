import { GameTile } from '@/components/game/GameTile';
import type { TileGame } from '@/lib/tile-game';

export function TileGrid({
  tiles,
}: {
  tiles: readonly { game: TileGame; size: 'xl' | 'lg' | 'md' }[];
}) {
  return (
    <div className="tile-grid">
      {tiles.map((tile) => (
        <GameTile
          key={`${tile.size}-${tile.game.slug}`}
          game={tile.game}
          size={tile.size}
        />
      ))}
    </div>
  );
}
