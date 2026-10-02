'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';

type ToastContextValue = {
  showToast: (message: string) => void;
};

type ToastViewProps = { message: string; onClear: () => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [View, setView] = useState<ComponentType<ToastViewProps> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    void import('./ToastView').then((mod) => setView(() => mod.ToastView));
  }, []);

  const onClear = useCallback(() => setMessage(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && View ? <View message={message} onClear={onClear} /> : null}
    </ToastContext.Provider>
  );
}
