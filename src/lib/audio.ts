export function createAudioContext(): AudioContext {
  const Ctx = window.AudioContext
    ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error('Audio is not available in this browser.');
  return new Ctx();
}
