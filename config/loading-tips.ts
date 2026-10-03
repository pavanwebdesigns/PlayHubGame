/** One tip per Play. The index advances in this browser. */
export const LOADING_TIPS = [
  'Tap the heart to save a game to My games.',
  'On a phone, press Play to open the game full screen.',
  'Press F on a keyboard for full screen, Esc to exit.',
  'Wide-screen game? Turn your phone sideways.',
  'Not loading? Turn off your ad blocker for this site, then reload.',
  'Games you play show up in Continue playing on the home page.',
  'Looking for something quick? Try 5-minute games.',
  'Playing with a friend? Try Two players, one screen.',
  'Press / anywhere to search for a game.',
  'Most games save progress in this browser on this device.',
] as const;

export function tipAt(index: number): string {
  const count = LOADING_TIPS.length;
  const safe = ((index % count) + count) % count;
  return LOADING_TIPS[safe] ?? LOADING_TIPS[0];
}
