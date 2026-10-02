import type { ReactNode } from 'react';
import { WithToast } from '@/components/ui/WithToast';

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return <WithToast>{children}</WithToast>;
}