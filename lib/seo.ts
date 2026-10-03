import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { OG_COVER_MIN } from '@/lib/catalog/cover-widths';
import { coverAtWidth } from '@/lib/catalog/urls';

export const HOME_TITLE = 'Free Online Games – Play Instantly | PlayHubPlace';
export const OG_DEFAULT_IMAGE = '/og-default.png';
const TITLE_LIMIT = 60;

export function canonical(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  index: boolean;
  absoluteTitle?: boolean;
  image?: string;
  ogType?: 'website' | 'article';
}): Metadata {
  const path = canonical(input.path);
  const image = input.image ?? OG_DEFAULT_IMAGE;
  const robots = input.index
    ? { index: true, follow: true }
    : { index: false, follow: true };
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: path },
    robots,
    openGraph: {
      title: input.title,
      description: input.description,
      url: path,
      siteName: SITE_NAME,
      type: input.ogType ?? 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

/** Keep a branded title inside 60 characters. */
export function fitTitle(title: string): string {
  if (title.length <= TITLE_LIMIT) return title;
  const brand = ' | PlayHubPlace';
  const stem = title.endsWith(brand) ? title.slice(0, -brand.length) : title;
  const room = TITLE_LIMIT - brand.length - 1;
  return `${stem.slice(0, Math.max(room, 1)).trimEnd()}…${brand}`;
}

export function hubTitle(name: string): string {
  return fitTitle(`${name} Games – Play Free Online | PlayHubPlace`);
}

export function collectionTitle(name: string): string {
  return fitTitle(`${name} – Free Online Games | PlayHubPlace`);
}

export function pagedTitle(name: string, page: number): string {
  return fitTitle(`${name} Games – Page ${page} | PlayHubPlace`);
}

/** Cover art is the share image only when the source is at least 600 px wide. */
export function ogCover(cover: string, coverWidth: number | null): string {
  if (coverWidth == null || coverWidth < OG_COVER_MIN) return OG_DEFAULT_IMAGE;
  return coverAtWidth(cover, Math.min(1200, coverWidth));
}

/** "{Game} – Play Free Online | PlayHubPlace", kept to 60 characters. */
export function gameTitle(name: string): string {
  const suffix = ' – Play Free Online | PlayHubPlace';
  const full = `${name}${suffix}`;
  if (full.length <= 60) return full;
  const room = 60 - suffix.length - 1;
  const trimmed = name.slice(0, Math.max(room, 1)).trimEnd();
  return `${trimmed}…${suffix}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${canonical(path)}`;
}
