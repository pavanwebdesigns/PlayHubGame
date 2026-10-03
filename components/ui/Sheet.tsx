'use client';

import { useRef, type ReactNode } from 'react';
import { useOverlay } from '@/components/ui/use-overlay';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  mode?: 'page' | 'inline';
};

export function Sheet({
  open,
  onClose,
  title,
  children,
  mode = 'page',
}: SheetProps) {
  const page = mode === 'page';
  const { panelRef, titleId } = useOverlay({
    open,
    onClose,
    trap: page,
    lockScroll: page,
  });
  const startY = useRef<number | null>(null);
  if (!open) return null;

  return (
    <div
      className={
        page
          ? 'fixed inset-0 z-sheet flex items-end'
          : 'relative flex items-end'
      }
    >
      {page ? (
        <button
          type="button"
          className="absolute inset-0 bg-night/70"
          aria-label="Close"
          onClick={onClose}
        />
      ) : null}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={page || undefined}
        aria-labelledby={titleId}
        className="relative z-10 max-h-[80%] w-full overflow-auto rounded-sheet bg-raised p-4"
        onTouchStart={(event) => {
          startY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const start = startY.current;
          const end = event.changedTouches[0]?.clientY;
          startY.current = null;
          if (start == null || end == null) return;
          if (end - start > 80) onClose();
        }}
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-button bg-edge"
          aria-hidden="true"
        />
        <h2 id={titleId} className="text-title text-ink">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
