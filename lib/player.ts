export type PlayerPhase = 'cover' | 'loading' | 'playing' | 'error';
export type PlayerEvent = 'play' | 'loaded' | 'timeout' | 'reload';

export function nextPhase(phase: PlayerPhase, event: PlayerEvent): PlayerPhase {
  if (event === 'play' && phase === 'cover') return 'loading';
  if (event === 'loaded' && phase === 'loading') return 'playing';
  if (event === 'timeout' && phase === 'loading') return 'error';
  if (event === 'reload' && phase === 'error') return 'loading';
  return phase;
}

export function wantsImmersive(width: number, touchPoints: number): boolean {
  return width <= 1024 || touchPoints > 0;
}
