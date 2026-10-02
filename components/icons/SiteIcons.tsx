import type { ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  House,
  LayoutGrid,
  Maximize,
  Play,
  Search,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import { IconProvider } from '@/components/icons/IconProvider';

export function SiteIcons({ children }: { children: ReactNode }) {
  return (
    <IconProvider
      icons={{
        house: <House aria-hidden="true" size={20} />,
        categories: <LayoutGrid aria-hidden="true" size={20} />,
        search: <Search aria-hidden="true" size={20} />,
        heart: <Heart aria-hidden="true" size={20} />,
        clear: <X aria-hidden="true" size={20} />,
        previous: <ChevronLeft aria-hidden="true" size={20} />,
        next: <ChevronRight aria-hidden="true" size={20} />,
        share: <Share2 aria-hidden="true" size={20} />,
        maximize: <Maximize aria-hidden="true" size={20} />,
        flag: <Flag aria-hidden="true" size={20} />,
        phone: <Smartphone aria-hidden="true" size={48} />,
        play: <Play aria-hidden="true" size={20} />,
      }}
    >
      {children}
    </IconProvider>
  );
}
