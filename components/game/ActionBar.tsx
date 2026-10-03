'use client';

import { useState, useSyncExternalStore, type ComponentType } from 'react';
import { useSiteIcons } from '@/components/icons/IconProvider';
import { buttonClass } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Dialog } from '@/components/ui/Dialog';
import { CONTACT_EMAIL, contactEmailPublished } from '@/config/site';
import {
  readFavorites,
  readFavoritesSnapshot,
  subscribeFavorites,
  writeFavorites,
  type StoredFavorite,
} from '@/lib/favorites';
import { track } from '@/lib/analytics';
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
  const icons = useSiteIcons();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [ReportDialog, setReportDialog] = useState<ComponentType<
    Parameters<typeof Dialog>[0]
  > | null>(null);

  function openReport() {
    setOpen(true);
    if (ReportDialog) return;
    void import('@/components/ui/Dialog').then((mod) => setReportDialog(() => mod.Dialog));
  }
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
    track({
      name: exists ? 'favorite_remove' : 'favorite_add',
      slug: favorite.namespace,
    });
    showToast(exists ? 'Removed' : 'Saved to My games');
  }

  async function share() {
    const url = new URL(path, window.location.origin).href;
    const result = await shareOrCopy({ title, url });
    if (result === 'shared' || result === 'copied') {
      track({
        name: 'share',
        slug: favorite.namespace,
        method: result === 'shared' ? 'native' : 'copy',
      });
    }
    if (result === 'copied') showToast('Link copied');
    if (result === 'failed') {
      showToast('Could not copy the link. Copy it from the address bar.');
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" className={buttonClass('secondary')} onClick={toggleSave}>
        <span className={saved ? '[&_svg]:fill-spark [&_svg]:text-spark' : undefined}>
          {icons.heart}
        </span>
        {saved ? 'Saved' : 'Save'}
      </button>
      <button type="button" className={buttonClass('secondary')} onClick={() => void share()}>
        {icons.share}
        Share
      </button>
      <button type="button" className={buttonClass('secondary')} onClick={onFullscreen}>
        {icons.maximize}
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
      <button type="button" className={buttonClass('ghost')} onClick={openReport}>
        {icons.flag}
        Report a problem
      </button>
      {ReportDialog ? (
      <ReportDialog open={open} onClose={() => setOpen(false)} title="Report a problem">
        {contactEmailPublished() ? (
          <ul className="grid gap-2">
            {REASONS.map(([id, label]) => (
              <li key={id}>
                <a
                  className="inline-flex min-h-tap items-center text-play"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Problem with ${title}`)}&body=${encodeURIComponent(`${label}\n${path}`)}`}
                  onClick={() =>
                    track({
                      name: 'report_problem',
                      slug: favorite.namespace,
                      reason: id,
                    })
                  }
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink">Reporting isn’t open yet.</p>
        )}
      </ReportDialog>
      ) : null}
    </div>
  );
}
