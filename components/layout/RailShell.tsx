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

function Chevrons({ left }: { left: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {left ? (
        <>
          <path d="m11 17-5-5 5-5" />
          <path d="m18 17-5-5 5-5" />
        </>
      ) : (
        <>
          <path d="m6 17 5-5-5-5" />
          <path d="m13 17 5-5-5-5" />
        </>
      )}
    </svg>
  );
}

export function RailShell({
  preview = false,
  children,
}: {
  preview?: boolean;
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
      className={`side-rail min-h-tap flex-col gap-1 p-2 ${collapsed ? 'w-16' : 'w-56'}`}
      data-preview={preview ? 'desktop' : undefined}
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-label="Sections"
    >
      <button
        type="button"
        className="press inline-flex min-h-tap items-center gap-2 rounded-button px-2 text-ink"
        aria-pressed={collapsed}
        onClick={toggle}
      >
        <Chevrons left={!collapsed} />
        <span className={collapsed ? 'sr-only' : undefined}>
          {collapsed ? 'Expand menu' : 'Collapse menu'}
        </span>
      </button>
      {children}
    </aside>
  );
}
