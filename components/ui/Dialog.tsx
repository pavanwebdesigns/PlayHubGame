'use client';

import type { ReactNode } from 'react';
import { useOverlay } from '@/components/ui/use-overlay';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  mode?: 'page' | 'inline';
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  mode = 'page',
}: DialogProps) {
  const page = mode === 'page';
  const { panelRef, titleId } = useOverlay({
    open,
    onClose,
    trap: page,
    lockScroll: page,
  });
  if (!open) return null;

  return (
    <div
      className={
        page
          ? 'fixed inset-0 z-sheet flex items-center justify-center p-4'
          : 'relative flex items-center justify-center p-4'
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
        className="relative z-10 w-full max-w-md rounded-sheet bg-raised p-4"
      >
        <h2 id={titleId} className="text-title text-ink">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
