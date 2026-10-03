import { GAMEPIX_SID } from '@/config/site';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function slugFromNamespace(namespace: string): string | null {
  const slug = namespace.toLowerCase();
  return SLUG_PATTERN.test(slug) ? slug : null;
}

export function stripQuery(value: string): string | null {
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

/** One query string, and `sid` is always the partner id. */
export function embedUrlWithSid(
  value: string,
  sid: string = GAMEPIX_SID,
): string | null {
  try {
    const url = new URL(value);
    url.searchParams.set('sid', sid);
    return url.toString();
  } catch {
    return null;
  }
}

export function coverAtWidth(value: string, width: number): string {
  const url = new URL(value);
  url.searchParams.set('w', String(width));
  return url.toString();
}

/** Never ask the CDN for more pixels than the file actually has. */
export function requestedCoverWidth(
  wanted: number,
  natural: number | null,
): number {
  if (natural == null) return Math.min(wanted, 160);
  return Math.max(1, Math.min(wanted, natural));
}

export function toIso(value: string): string | null {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString();
}
