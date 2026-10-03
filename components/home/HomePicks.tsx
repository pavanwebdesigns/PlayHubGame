import type { CSSProperties } from 'react';
import { GameTile } from '@/components/game/GameTile';
import { XL_COVER_MIN } from '@/lib/catalog/cover-widths';
import type { GameRecord } from '@/lib/catalog/types';
import {
  mergePickTiles,
  packPickTiles,
  pickClassName,
  pickCoverSizes,
  type PickSize,
} from '@/lib/home-picks';
import { todaysPicks } from '@/lib/picks';
import { toTileGame } from '@/lib/tile-game';

function featured(games: readonly GameRecord[]) {
  let xlUsed = false;
  return games.map((game) => {
    const sharp = (game.coverWidth ?? 0) >= XL_COVER_MIN;
    const size: PickSize = !xlUsed && sharp ? 'xl' : 'md';
    if (size === 'xl') xlUsed = true;
    return { game: toTileGame(game), size };
  });
}

export function HomePicks({
  games,
  now,
}: {
  games: readonly GameRecord[];
  now: Date;
}) {
  const picks = mergePickTiles(
    packPickTiles(featured(todaysPicks(games, now, true))),
    packPickTiles(featured(todaysPicks(games, now, false))),
  );

  return (
    <div className="tile-grid home-picks">
      {picks.map((pick) => {
        const thumbSize = pick.thumb?.size ?? null;
        const wideSize = pick.wide?.size ?? null;
        const style = {
          '--thumb-order': pick.thumb?.order ?? 0,
          '--wide-order': pick.wide?.order ?? 0,
        } as CSSProperties;
        return (
          <GameTile
            key={pick.game.slug}
            game={pick.game}
            size={thumbSize === 'xl' || wideSize === 'xl' ? 'xl' : 'md'}
            span={false}
            sizes={pickCoverSizes(thumbSize, wideSize)}
            className={pickClassName(pick)}
            style={style}
            source="todays_picks"
            position={pick.thumb?.order ?? pick.wide?.order ?? 0}
            positionWide={pick.wide?.order}
          />
        );
      })}
    </div>
  );
}
