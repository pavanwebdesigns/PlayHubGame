import { House, Sparkles } from 'lucide-react';
import { COLLECTION_ICONS, HUB_ICONS } from '@/components/game/hub-icons';
import { RailShell } from '@/components/layout/RailShell';
import type { CollectionSlug } from '@/config/collections';
import type { HubSlug } from '@/config/taxonomy';
import type { LucideIcon } from 'lucide-react';

type RailHub = { slug: HubSlug; label: string; count: number };
type RailCollection = { slug: CollectionSlug; label: string };

export function SideRail({
  hubs,
  collections,
  preview = false,
}: {
  hubs: readonly RailHub[];
  collections: readonly RailCollection[];
  preview?: boolean;
}) {
  return (
    <RailShell preview={preview}>
      <RailLink href="/" label="Home" icon={House} />
      <RailLink href="/new/" label="New" icon={Sparkles} />
      {collections.map((item) => (
        <RailLink
          key={item.slug}
          href={`/collection/${item.slug}/`}
          label={item.label}
          icon={COLLECTION_ICONS[item.slug]}
        />
      ))}
      {hubs.map((item) => (
        <RailLink
          key={item.slug}
          href={`/category/${item.slug}/`}
          label={item.label}
          detail={String(item.count)}
          icon={HUB_ICONS[item.slug]}
        />
      ))}
    </RailShell>
  );
}

function RailLink({
  href,
  label,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <a
      href={href}
      className="relative inline-flex min-h-tap items-center gap-2 rounded-tile px-2 text-ink"
    >
      <Icon aria-hidden="true" size={20} />
      <span className="rail-label">{label}</span>
      {detail ? <span className="rail-count text-ink-muted">{detail}</span> : null}
    </a>
  );
}
