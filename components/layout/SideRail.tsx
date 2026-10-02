'use client';

import { ChevronsLeft, ChevronsRight, House, Sparkles } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { COLLECTION_ICONS, HUB_ICONS } from '@/components/game/hub-icons';
import type { CollectionSlug } from '@/config/collections';
import type { HubSlug } from '@/config/taxonomy';

export const RAIL_KEY = 'ph:rail:v1';

const railListeners = new Set<() => void>();
let collapsedWithoutStorage: boolean | null = null;

function subscribeRail(listener: () => void): () => void {
  railListeners.add(listener);
  return () => {
    railListeners.delete(listener);
  };
}

function emitRail(): void {
  for (const listener of railListeners) listener();
}

function readCollapsed(): boolean {
  if (collapsedWithoutStorage !== null) return collapsedWithoutStorage;
  try {
    return localStorage.getItem(RAIL_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

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
  const collapsed = useSyncExternalStore(
    subscribeRail,
    readCollapsed,
    () => false,
  );

  function toggle() {
    const next = !collapsed;
    try {
      localStorage.setItem(RAIL_KEY, next ? 'collapsed' : 'expanded');
      collapsedWithoutStorage = null;
    } catch {
      collapsedWithoutStorage = next;
    }
    emitRail();
  }

  return (
    <aside
      className={`side-rail min-h-tap flex-col gap-1 p-2 ${collapsed ? 'w-16' : 'w-56'}`}
      data-preview={preview ? 'desktop' : undefined}
      aria-label="Sections"
    >
      <button
        type="button"
        className="press inline-flex min-h-tap items-center gap-2 rounded-button px-2 text-ink"
        aria-pressed={collapsed}
        onClick={toggle}
      >
        {collapsed ? (
          <ChevronsRight aria-hidden="true" size={20} />
        ) : (
          <ChevronsLeft aria-hidden="true" size={20} />
        )}
        <span className={collapsed ? 'sr-only' : undefined}>
          {collapsed ? 'Expand menu' : 'Collapse menu'}
        </span>
      </button>
      <RailLink href="/" label="Home" icon={House} collapsed={collapsed} />
      <RailLink
        href="/new/"
        label="New"
        icon={Sparkles}
        collapsed={collapsed}
      />
      {collections.map((item) => (
        <RailLink
          key={item.slug}
          href={`/collection/${item.slug}/`}
          label={item.label}
          icon={COLLECTION_ICONS[item.slug]}
          collapsed={collapsed}
        />
      ))}
      {hubs.map((item) => (
        <RailLink
          key={item.slug}
          href={`/category/${item.slug}/`}
          label={item.label}
          detail={String(item.count)}
          icon={HUB_ICONS[item.slug]}
          collapsed={collapsed}
        />
      ))}
    </aside>
  );
}

function RailLink({
  href,
  label,
  detail,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  detail?: string;
  icon: typeof House;
  collapsed: boolean;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-tap items-center gap-2 rounded-tile px-2 text-ink"
    >
      <Icon aria-hidden="true" size={20} />
      <span className={collapsed ? 'sr-only' : undefined}>
        {label}
        {detail && collapsed ? ` ${detail}` : ''}
      </span>
      {detail && !collapsed ? (
        <span className="text-ink-muted">{detail}</span>
      ) : null}
    </a>
  );
}
