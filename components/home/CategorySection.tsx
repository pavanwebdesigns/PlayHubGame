import { CategoryCard } from '@/components/game/CategoryCard';
import { HUB_ICONS } from '@/components/game/hub-icons';
import { HUB_NAMES, type HubSlug } from '@/config/taxonomy';

export function CategorySection({
  hubs,
}: {
  hubs: readonly { slug: HubSlug; count: number }[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-title text-ink">Categories</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map((hub) => (
          <CategoryCard
            key={hub.slug}
            href={`/category/${hub.slug}/`}
            icon={HUB_ICONS[hub.slug]}
            name={HUB_NAMES[hub.slug]}
            count={hub.count}
          />
        ))}
      </div>
    </section>
  );
}
