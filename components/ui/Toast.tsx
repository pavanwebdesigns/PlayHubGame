'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const TOAST_MS = 3000;

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(TOAST_MS);
  const started = useRef(0);

  function showToast(next: string) {
    remaining.current = TOAST_MS;
    setPaused(false);
    setMessage(next);
  }

  useEffect(() => {
    if (!message || paused) return;
    started.current = Date.now();
    const timer = window.setTimeout(() => setMessage(null), remaining.current);
    return () => {
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started.current),
      );
      window.clearTimeout(timer);
    };
  }, [message, paused]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-toast flex justify-center px-4"
      >
        {message ? (
          <p
            className="pointer-events-auto rounded-button bg-deck px-4 py-3 text-ink"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {message}
          </p>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
