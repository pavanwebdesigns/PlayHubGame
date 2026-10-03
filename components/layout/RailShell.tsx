'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

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

export function RailShell({
  preview = false,
  collapseIcon,
  expandIcon,
  children,
}: {
  preview?: boolean;
  collapseIcon: ReactNode;
  expandIcon: ReactNode;
  children: ReactNode;
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
      className="side-rail min-h-tap flex-col gap-1 p-2"
      data-preview={preview ? 'desktop' : undefined}
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-label="Sections"
    >
      <button
        type="button"
        className="rail-toggle press relative inline-flex min-h-tap w-full min-w-0 items-center gap-2 rounded-button px-2 text-ink"
        aria-pressed={collapsed}
        onClick={toggle}
      >
        {collapsed ? expandIcon : collapseIcon}
        <span className="rail-toggle-label">{collapsed ? 'Expand menu' : 'Collapse menu'}</span>
      </button>
      {children}
    </aside>
  );
}
