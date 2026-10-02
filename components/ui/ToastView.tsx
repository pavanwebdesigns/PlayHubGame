'use client';

import { useEffect, useRef, useState } from 'react';

const TOAST_MS = 3000;

export function ToastView({
  message,
  onClear,
}: {
  message: string;
  onClear: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(TOAST_MS);
  const started = useRef(0);

  useEffect(() => {
    if (paused) return;
    started.current = Date.now();
    const timer = window.setTimeout(onClear, remaining.current);
    return () => {
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started.current),
      );
      window.clearTimeout(timer);
    };
  }, [message, onClear, paused]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-toast flex justify-center px-4"
    >
      <p
        className="pointer-events-auto rounded-button bg-deck px-4 py-3 text-ink"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {message}
      </p>
    </div>
  );
}
