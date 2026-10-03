'use client';

import { useSyncExternalStore } from 'react';
import { HOME_ROW_CAP, Row } from '@/components/game/Row';
import { useSiteIcons } from '@/components/icons/IconProvider';
import { ContinueSkeleton } from '@/components/home/ContinueSkeleton';
import { parseRecent, readRecentSnapshot, subscribeRecent } from '@/lib/recent';
import { getTileMap, subscribeTileMap } from '@/lib/tile-lookup';

function subscribeIdle(): () => void {
  return () => {};
}

export function ContinuePlaying() {
  const icons = useSiteIcons();
  const raw = useSyncExternalStore(subscribeRecent, readRecentSnapshot, () => null);
  const entries = parseRecent(raw);
  const tiles = useSyncExternalStore(
    entries.length > 0 ? subscribeTileMap : subscribeIdle,
    getTileMap,
    () => null,
  );
  if (!raw || entries.length === 0) return null;
  if (!tiles) return <ContinueSkeleton />;
  const games = entries.flatMap((entry) => {
    const tile = tiles.get(entry.slug);
    return tile ? [tile] : [];
  });
  if (games.length === 0) return null;
  return (
    <Row
      title="Continue playing"
      href="/my-games/"
      games={games.slice(0, HOME_ROW_CAP)}
      source="row:continue"
      previous={icons.previous}
      next={icons.next}
    />
  );
}
