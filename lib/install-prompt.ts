import type { RecentEntry } from '@/lib/recent';

export const INSTALL_GAMES = 3;
export const INSTALL_DAYS = 2;
export const INSTALL_DISMISS_KEY = 'ph:install-dismiss:v1';

/** True after three different games on two different days, unless dismissed. */
export function installEligible(
  entries: readonly RecentEntry[],
  dismissed: boolean,
): boolean {
  if (dismissed) return false;
  const games = new Set(entries.map((entry) => entry.slug));
  const days = new Set(
    entries.map((entry) => entry.at.slice(0, 10)).filter((day) => day.length === 10),
  );
  return games.size >= INSTALL_GAMES && days.size >= INSTALL_DAYS;
}
