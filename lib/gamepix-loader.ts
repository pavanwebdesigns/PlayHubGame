import type { ImageLoaderProps } from 'next/image';

/** Sets `w` on GamePix cover URLs. Local and other images pass through. */
export default function gamepixLoader({
  src,
  width,
}: ImageLoaderProps): string {
  if (src.startsWith('/') || src.startsWith('data:')) return src;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (!url.hostname.endsWith('gamepix.com')) return src;
  url.searchParams.set('w', String(width));
  return url.toString();
}
