'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type SiteIconSet = {
  house: ReactNode;
  categories: ReactNode;
  search: ReactNode;
  heart: ReactNode;
  clear: ReactNode;
  previous: ReactNode;
  next: ReactNode;
  share: ReactNode;
  maximize: ReactNode;
  flag: ReactNode;
  phone: ReactNode;
  play: ReactNode;
};

const SiteIconContext = createContext<SiteIconSet | null>(null);

export function IconProvider({
  icons,
  children,
}: {
  icons: SiteIconSet;
  children: ReactNode;
}) {
  return <SiteIconContext.Provider value={icons}>{children}</SiteIconContext.Provider>;
}

export function useSiteIcons(): SiteIconSet {
  const icons = useContext(SiteIconContext);
  if (!icons) throw new Error('Site icons are missing.');
  return icons;
}
