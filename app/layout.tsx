import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | PlayHubPlace',
  },
  description: DEFAULT_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
