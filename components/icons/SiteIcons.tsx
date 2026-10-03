import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { IconProvider } from '@/components/icons/IconProvider';

export function SiteIcons({ children }: { children: ReactNode }) {
  return (
    <IconProvider
      icons={{
        house: <Icon name="house" />,
        categories: <Icon name="layout-grid" />,
        search: <Icon name="search" />,
        heart: <Icon name="heart" />,
        clear: <Icon name="x" />,
        previous: <Icon name="chevron-left" />,
        next: <Icon name="chevron-right" />,
        share: <Icon name="share-2" />,
        maximize: <Icon name="maximize" />,
        flag: <Icon name="flag" />,
        phone: <Icon name="smartphone" size={48} />,
        play: <Icon name="play" />,
      }}
    >
      {children}
    </IconProvider>
  );
}
