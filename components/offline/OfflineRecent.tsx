'use client';

import { useSyncExternalStore } from 'react';
import { parseRecent, readRecentSnapshot, subscribeRecent } from '@/lib/recent';

function subscribeOnline(listener: () => void): () => void {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

export function OfflineRecent() {
  const raw = useSyncExternalStore(subscribeRecent, readRecentSnapshot, () => null);
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => false);
  const entries = parseRecent(raw);

  if (entries.length === 0) {
    return <p className="text-ink-muted">Games you play will be listed here.</p>;
  }

  return (
    <ul className="grid gap-2">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <a
            href={`/game/${entry.slug}/`}
            aria-disabled={online ? undefined : true}
            tabIndex={online ? undefined : -1}
            className="inline-flex min-h-tap items-center text-ink"
            onClick={(event) => {
              if (!online) event.preventDefault();
            }}
          >
            {entry.slug.replace(/-/g, ' ')}
          </a>
        </li>
      ))}
    </ul>
  );
}
