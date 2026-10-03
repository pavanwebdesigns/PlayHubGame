import { SearchBox } from '@/components/search/SearchBox';
import { HUB_NAMES, HUB_SLUGS } from '@/config/taxonomy';
import { gamesInHub, loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';
import { todaysPicks } from '@/lib/picks';
import { pageMetadata } from '@/lib/seo';
import { toTileGame } from '@/lib/tile-game';

export const metadata = pageMetadata({
  title: 'Search',
  description: 'Search free browser games on PlayHubPlace.',
  path: '/search/',
  index: false,
});

export default function SearchPage() {
  const hubs = HUB_SLUGS.map((slug) => ({
    slug,
    label: HUB_NAMES[slug],
    count: gamesInHub(slug).length,
  }))
    .filter((hub) => hub.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const picks = todaysPicks(loadCurated(), buildToday(), false)
    .slice(0, 12)
    .map((game) => toTileGame(game));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-display-sm text-ink">Search</h1>
      <SearchBox
        hubs={hubs.map((hub) => ({
          href: `/category/${hub.slug}/`,
          label: hub.label,
        }))}
        picks={picks}
      />
    </main>
  );
}
