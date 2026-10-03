'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

export function WithToast({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
