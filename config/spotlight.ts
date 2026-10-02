/**
 * One-line Spotlight pitches, keyed by game slug.
 * Pavan writes these. A missing or blank slug renders no pitch line.
 * `gallery-sample` is only the design-system fixture.
 */
export const SPOTLIGHT_PITCHES: Readonly<Record<string, string>> = {
  'gallery-sample': 'A one-line pitch from the spotlight config.',
};

export function spotlightPitch(slug: string): string | null {
  const pitch = SPOTLIGHT_PITCHES[slug];
  if (typeof pitch !== 'string') return null;
  const trimmed = pitch.trim();
  return trimmed.length > 0 ? trimmed : null;
}
