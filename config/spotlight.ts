/**
 * Daily Spotlight rotation. Pavan writes each pitch after playing.
 * A missing or blank pitch renders no pitch line.
 * `gallery-sample` is only the design-system fixture.
 *
 * Day 1 of the year is the first slug. A slug that leaves the catalog is
 * skipped for the next one.
 */
export const SPOTLIGHT_ROTATION = [
  'prism-match-3d',
  'drop-planets',
  'defend-the-castle',
  'garden-master',
  'quarantine-zombies',
  'nova-hop',
  'boost-balloon',
  'billiards-on-ice',
  'combat-landing',
  'vegan-quest',
  'kobadoo-emojis',
  'flag-memory-match',
  'trap-the-convoy',
  'hoops-and-fruits',
  'merge-mine-idle-clicker',
  'memory-cards',
  'math-fight-club',
  'the-floor-is-lying',
  'emberdeck',
  'racing-ball-3d',
  'match-mystery',
  'seat-the-guests',
  'perimeter',
  'stack-rocket',
  'ancient-armies-vs-modern-weapons',
  'lotl-spa',
  'skater-kitty',
  'penalty-kick-wiz',
  'kobadoo-numbers',
  'merge-royal',
] as const;

const EMPTY_PITCHES = Object.fromEntries(
  SPOTLIGHT_ROTATION.map((slug) => [slug, '']),
) as Record<(typeof SPOTLIGHT_ROTATION)[number], string>;

export const SPOTLIGHT_PITCHES: Readonly<Record<string, string>> = {
  'gallery-sample': 'A one-line pitch from the spotlight config.',
  ...EMPTY_PITCHES,
};

export function spotlightPitch(slug: string): string | null {
  const pitch = SPOTLIGHT_PITCHES[slug];
  if (typeof pitch !== 'string') return null;
  const trimmed = pitch.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** 1-based day of the UTC year. */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((current - start) / 86_400_000) + 1;
}

export function spotlightChoice(
  available: ReadonlySet<string>,
  day: number,
  lowRes: ReadonlySet<string> = new Set(),
): { slug: string | null; skipped: string[]; lowRes: string[] } {
  const total = SPOTLIGHT_ROTATION.length;
  const start = (((day - 1) % total) + total) % total;
  const skipped: string[] = [];
  const soft: string[] = [];
  for (let offset = 0; offset < total; offset += 1) {
    const slug = SPOTLIGHT_ROTATION[(start + offset) % total];
    if (!slug) continue;
    if (!available.has(slug)) {
      skipped.push(slug);
      continue;
    }
    if (lowRes.has(slug)) {
      soft.push(slug);
      continue;
    }
    return { slug, skipped, lowRes: soft };
  }
  return { slug: null, skipped, lowRes: soft };
}
