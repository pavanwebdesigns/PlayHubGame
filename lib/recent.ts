export const RECENT_KEY = 'ph:recent:v1';
export const RECENT_MAX = 30;

export type RecentEntry = { slug: string; at: string };

/** Hand-checked so the home page does not download Zod. */
export function parseRecent(raw: string | null): RecentEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const entries: RecentEntry[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const slug = (item as { slug?: unknown }).slug;
      const at = (item as { at?: unknown }).at;
      if (typeof slug !== 'string' || slug.length === 0) continue;
      if (typeof at !== 'string' || at.length === 0) continue;
      entries.push({ slug, at });
      if (entries.length === RECENT_MAX) break;
    }
    return entries;
  } catch {
    return [];
  }
}

export function mergeRecent(
  entries: readonly RecentEntry[],
  slug: string,
  at: string,
): RecentEntry[] {
  return [{ slug, at }, ...entries.filter((entry) => entry.slug !== slug)].slice(
    0,
    RECENT_MAX,
  );
}

const listeners = new Set<() => void>();

export function subscribeRecent(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function readRecentSnapshot(): string | null {
  try {
    return localStorage.getItem(RECENT_KEY);
  } catch {
    return null;
  }
}

export function writeRecent(entries: readonly RecentEntry[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, RECENT_MAX)));
  } catch {
    // Storage can be blocked. The page still plays.
  }
  emit();
}

export function rememberRecent(slug: string, at = new Date().toISOString()): void {
  writeRecent(mergeRecent(parseRecent(readRecentSnapshot()), slug, at));
}

export function clearRecent(): void {
  writeRecent([]);
}
