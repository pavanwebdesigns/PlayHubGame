import { GameTile } from '@/components/game/GameTile';
import { mdHiddenAt, type TileColumns } from '@/lib/tile-pack';
import type { TileGame } from '@/lib/tile-game';

export type { TileColumns };

export function TileGrid({
  tiles,
  columns,
}: {
  tiles: readonly { game: TileGame; size: 'xl' | 'md' }[];
  columns?: TileColumns;
}) {
  const mdTotal = tiles.filter((tile) => tile.size === 'md').length;
  const packMd =
    tiles[0]?.size === 'xl' &&
    tiles.every((tile, index) => index === 0 || tile.size === 'md');
  const hiddenByIndex = tiles.map((tile, index) => {
    if (!packMd || tile.size !== 'md') return '';
    const mdIndex = tiles
      .slice(0, index)
      .filter((item) => item.size === 'md').length;
    return mdHiddenAt(mdIndex, mdTotal)
      .map((count) => `hide-cols-${count}`)
      .join(' ');
  });

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
