'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconButton } from '@/components/ui/IconButton';

export function RowScroller({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [edges, setEdges] = useState({ prev: false, next: false });

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function measure() {
      if (!scroller) return;
      const extra = scroller.scrollWidth - scroller.clientWidth;
      setOverflow(extra > 1);
      setEdges({
        prev: scroller.scrollLeft > 1,
        next:
          scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1,
      });
    }

    measure();
    scroller.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      scroller.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  function move(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    const tile = scroller?.querySelector<HTMLElement>('[data-orientation]');
    if (!scroller || !tile) return;
    const gap = 16;
    scroller.scrollBy({
      left: direction * (tile.offsetWidth + gap),
      behavior: 'smooth',
    });
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollerRef}
        className="row-scroller"
        tabIndex={0}
        role="region"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(1);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {children}
      </div>
      {overflow && edges.prev ? (
        <div className="row-edge row-edge-prev">
          <IconButton
            label="Previous games"
            icon={ChevronLeft}
            className="bg-deck"
            onClick={() => move(-1)}
          />
        </div>
      ) : null}
      {overflow && edges.next ? (
        <div className="row-edge row-edge-next">
          <IconButton
            label="Next games"
            icon={ChevronRight}
            className="bg-deck"
            onClick={() => move(1)}
          />
        </div>
      ) : null}
    </div>
  );
}
