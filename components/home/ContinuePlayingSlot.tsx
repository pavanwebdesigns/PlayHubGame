'use client';

import { useEffect, useState, useSyncExternalStore, type ComponentType } from 'react';
import { ContinueSkeleton } from '@/components/home/ContinueSkeleton';
import { parseRecent, readRecentSnapshot, subscribeRecent } from '@/lib/recent';

export function ContinuePlayingSlot() {
  const raw = useSyncExternalStore(subscribeRecent, readRecentSnapshot, () => null);
  const [Row, setRow] = useState<ComponentType | null>(null);
  const hasEntries = parseRecent(raw).length > 0;

  useEffect(() => {
    if (!hasEntries) return;
    let cancel = false;
    void import('./ContinuePlaying').then((mod) => {
      if (!cancel) setRow(() => mod.ContinuePlaying);
    });
    return () => {
      cancel = true;
    };
  }, [hasEntries]);

  if (!hasEntries) return null;
  if (!Row) return <ContinueSkeleton />;
  return <Row />;
}
