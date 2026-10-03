export function readBest(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeBest(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // A blocked store still shows this round's result.
  }
}

/** Higher CPS replaces the stored best. Lower reaction time replaces it. */
export function keepBest(
  current: number | null,
  next: number,
  mode: 'high' | 'low',
): number {
  if (current == null) return next;
  return mode === 'high' ? Math.max(current, next) : Math.min(current, next);
}
