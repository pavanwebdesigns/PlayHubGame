import type { GamePixGame } from '../types';

export function titleFromSlug(slug: string): string {
  const words = slug.split('-').filter((part) => part.length > 0);
  if (words.length === 0) return 'Game';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function embedUrl(slug: string): string {
  return `https://play.gamepix.com/${encodeURIComponent(slug)}/embed?sid=LC991`;
}

export function gameFromSlug(id: string, slug: string): GamePixGame {
  return {
    id,
    title: titleFromSlug(slug),
    namespace: slug,
    description: '',
    category: '',
    orientation: 'all',
    quality_score: 0,
    width: 0,
    height: 0,
    date_published: '',
    date_modified: '',
    banner_image: '',
    image: '',
    url: embedUrl(slug),
  };
}
