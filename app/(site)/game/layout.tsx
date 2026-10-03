import type { ReactNode } from 'react';
import { WithToast } from '@/components/ui/WithToast';

export default function GameLayout({ children }: { children: ReactNode }) {
  return <WithToast>{children}</WithToast>;
}
