'use client';

import { useEffect, useId, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useOverlay(options: {
  open: boolean;
  onClose: () => void;
  trap: boolean;
  lockScroll: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(options.onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = options.onClose;
  });

  useEffect(() => {
    if (!options.open) return;
    const panel = panelRef.current;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (options.lockScroll) document.body.style.overflow = 'hidden';

    function focusables(): HTMLElement[] {
      if (!panel) return [];
      return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => !element.hasAttribute('disabled'),
      );
    }

    if (options.trap) focusables()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (!options.trap || event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [options.open, options.trap, options.lockScroll]);

  return { panelRef, titleId };
}
