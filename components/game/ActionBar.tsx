'use client';

import { Flag, Heart, Maximize, Share2 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { CONTACT_EMAIL, contactEmailPublished } from '@/config/site';
import {
  readFavorites,
  readFavoritesSnapshot,
  subscribeFavorites,
  writeFavorites,
  type StoredFavorite,
} from '@/lib/favorites';
import { shareOrCopy } from '@/lib/share';

const REASONS = [
  ["It won't load", "It won't load"],
  ['Broken controls', 'Broken controls'],
  ['Inappropriate', 'Inappropriate'],
  ['Something else', 'Something else'],
] as const;

export function ActionBar({
  favorite,
  title,
  path,
  theatre,
  onTheatre,
  onFullscreen,
}: {
  favorite: StoredFavorite;
  title: string;
  path: string;
  theatre: boolean;
  onTheatre: () => void;
  onFullscreen: () => void;
}) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const raw = useSyncExternalStore(
    subscribeFavorites,
    readFavoritesSnapshot,
    () => null,
  );
  const saved = readFavorites(raw).some(
    (item) => item.namespace === favorite.namespace || item.id === favorite.id,
  );

  function toggleSave() {
    const current = readFavorites(readFavoritesSnapshot());
    const exists = current.some(
      (item) => item.namespace === favorite.namespace || item.id === favorite.id,
    );
    const next = exists
      ? current.filter(
          (item) =>
            item.namespace !== favorite.namespace && item.id !== favorite.id,
        )
      : [...current, favorite];
    writeFavorites(next);
    showToast(exists ? 'Removed' : 'Saved to My games');
  }

  async function share() {
    const url = new URL(path, window.location.origin).href;
    const result = await shareOrCopy({ title, url });
    if (result === 'copied') showToast('Link copied');
    if (result === 'failed') {
      showToast('Could not copy the link. Copy it from the address bar.');
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" className={buttonClass('secondary')} onClick={toggleSave}>
        <Heart
          aria-hidden="true"
          size={20}
          className={saved ? 'fill-spark text-spark' : undefined}
        />
        {saved ? 'Saved' : 'Save'}
      </button>
      <button type="button" className={buttonClass('secondary')} onClick={() => void share()}>
        <Share2 aria-hidden="true" size={20} />
        Share
      </button>
      <button type="button" className={buttonClass('secondary')} onClick={onFullscreen}>
        <Maximize aria-hidden="true" size={20} />
        Full screen
      </button>
      <button
        type="button"
        className={`${buttonClass('secondary')} hidden lg:inline-flex`}
        aria-pressed={theatre}
        onClick={onTheatre}
      >
        Theatre
      </button>
      <button type="button" className={buttonClass('ghost')} onClick={() => setOpen(true)}>
        <Flag aria-hidden="true" size={20} />
        Report a problem
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Report a problem">
        {contactEmailPublished() ? (
          <ul className="grid gap-2">
            {REASONS.map(([id, label]) => (
              <li key={id}>
                <a
                  className="inline-flex min-h-tap items-center text-play"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Problem with ${title}`)}&body=${encodeURIComponent(`${label}\n${path}`)}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink">Reporting isn’t open yet.</p>
        )}
      </Dialog>
    </div>
  );
}
