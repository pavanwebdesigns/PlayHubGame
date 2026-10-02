import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { SideRail } from '@/components/layout/SideRail';
import { TopBar } from '@/components/layout/TopBar';
import { visibleCollections } from '@/config/collections';
import { HUB_NAMES, HUB_SLUGS } from '@/config/taxonomy';
import { loadCurated } from '@/lib/catalog/load';
import { buildToday } from '@/lib/build-clock';

export function SiteChrome({ children }: { children: ReactNode }) {
  const games = loadCurated();
  const now = buildToday();
  const hubs = HUB_SLUGS.flatMap((slug) => {
    const count = games.filter((game) => game.hub === slug).length;
    if (count === 0) return [];
    return [{ slug, label: HUB_NAMES[slug], count }];
  });
  const collections = visibleCollections(games, now).map((item) => ({
    slug: item.slug,
    label: item.name,
  }));

  return (
    <div className="site-shell">
      <TopBar />
      <div className="site-body">
        <SideRail hubs={hubs} collections={collections} />
        <div className="site-main min-w-0">
          {children}
          <Footer year={now.getUTCFullYear()} />
        </div>
      </div>
      <BottomNav
        categories={hubs.map((hub) => ({
          href: `/category/${hub.slug}/`,
          label: hub.label,
        }))}
        collections={collections.map((item) => ({
          href: `/collection/${item.slug}/`,
          label: item.label,
        }))}
      />
    </div>
  );
}
