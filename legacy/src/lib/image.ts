export function gamepixImage(url: string, width: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set('w', String(width));
  return parsed.toString();
}

export function gamepixSrcSet(url: string, widths: readonly number[]): string {
  return widths.map((width) => `${gamepixImage(url, width)} ${width}w`).join(', ');
}

export const COVER_PLACEHOLDER = '/placeholder-cover.svg';

export function coverSrc(url: string, width: number): string {
  if (!url) return COVER_PLACEHOLDER;
  try {
    return gamepixImage(url, width);
  } catch {
    return COVER_PLACEHOLDER;
  }
}
