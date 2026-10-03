export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleIndexes(
  length: number,
  count: number,
  seed: number,
): number[] {
  const indexes = Array.from({ length }, (_, index) => index);
  const random = mulberry32(seed);
  const take = Math.min(count, indexes.length);
  for (let i = 0; i < take; i += 1) {
    const swap = i + Math.floor(random() * (indexes.length - i));
    const current = indexes[i];
    const next = indexes[swap];
    if (current === undefined || next === undefined) continue;
    indexes[i] = next;
    indexes[swap] = current;
  }
  return indexes.slice(0, take);
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];
  if (sorted.length % 2 === 1) return upper ?? 0;
  const lower = sorted[mid - 1];
  if (lower === undefined || upper === undefined) return 0;
  return (lower + upper) / 2;
}
