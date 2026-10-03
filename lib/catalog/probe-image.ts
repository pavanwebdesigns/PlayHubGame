import { imageSize, type PixelSize } from '@/lib/catalog/image-size';

const HEADER_CAP = 256 * 1024;

function concat(chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

/** Read bytes until the image header yields a size, then stop. */
export async function readImageHeader(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PixelSize | null> {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok || !response.body) return null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < HEADER_CAP) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      total += value.length;
      const size = imageSize(concat(chunks));
      if (size) return size;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return imageSize(concat(chunks));
}

/** One attempt plus two retries. A miss is not a width. */
export async function probeImageUrl(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PixelSize | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const size = await readImageHeader(url, fetchImpl);
      if (size) return size;
    } catch {
      // The next attempt gets a fresh request.
    }
  }
  return null;
}
