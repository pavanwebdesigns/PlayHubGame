import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/site';
import { LEGACY_GAME_REDIRECT } from '@/lib/legacy-redirect';
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: LEGACY_GAME_REDIRECT }} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-play focus:px-3 focus:py-2 focus:text-night"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
