import { z } from 'zod';

export const SEARCHES_KEY = 'ph:searches:v1';
const MAX_SEARCHES = 8;

export function parseSearches(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = z.array(z.string().min(1)).safeParse(parsed);
    if (!result.success) return [];
    return result.data.slice(0, MAX_SEARCHES);
  } catch {
    return [];
  }
}

export function mergeSearch(entries: readonly string[], query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [...entries];
  return [trimmed, ...entries.filter((entry) => entry !== trimmed)].slice(
    0,
    MAX_SEARCHES,
  );
}

const listeners = new Set<() => void>();

function emitSearches(): void {
  for (const listener of listeners) listener();
}

export function subscribeSearches(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readSearchesSnapshot(): string {
  return readSearches().join('\u0000');
}

export function readSearches(): string[] {
  try {
    return parseSearches(localStorage.getItem(SEARCHES_KEY));
  } catch {
    return [];
  }
}

export function writeSearches(entries: readonly string[]): void {
  try {
    localStorage.setItem(
      SEARCHES_KEY,
      JSON.stringify(entries.slice(0, MAX_SEARCHES)),
    );
  } catch {
    // Recent searches are optional.
  }
  emitSearches();
}
