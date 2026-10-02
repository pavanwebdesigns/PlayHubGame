import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/config/site';

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
}): Metadata {
  const path = canonical(input.path);
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
      type: 'website',
      ...(input.image ? { images: [input.image] } : {}),
    },
  };
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
