import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/site';
import { coverAspect } from '@/lib/cover-aspect';
import { LEGACY_GAME_REDIRECT } from '@/lib/legacy-redirect';
import {
  COVER_FALLBACK_SCRIPT,
  INSTALL_PROMPT_SCRIPT,
  ROW_SCROLL_SCRIPT,
  SAVE_GAME_SCRIPT,
  SW_REGISTER_SCRIPT,
  TILE_PREFETCH_SCRIPT,
} from '@/lib/page-scripts';
import { AnalyticsBoot } from '@/components/analytics/AnalyticsBoot';
import { SiteIcons } from '@/components/icons/SiteIcons';
import { anekLatin, jersey15 } from './fonts';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#140B33',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | PlayHubPlace',
  },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: '/playlogo.svg' },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anekLatin.variable} ${jersey15.variable}`}
      style={{ '--cover-aspect': coverAspect() } as CSSProperties}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LEGACY_GAME_REDIRECT }} />
        <script dangerouslySetInnerHTML={{ __html: COVER_FALLBACK_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: ROW_SCROLL_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SAVE_GAME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TILE_PREFETCH_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-skip focus:bg-play focus:px-3 focus:py-2 focus:text-night"
        >
          Skip to content
        </a>
        <AnalyticsBoot />
        <SiteIcons>
          <div id="content">{children}</div>
        </SiteIcons>
        <div id="ph-toast" aria-live="polite" />
        <div
          id="ph-install"
          hidden
          className="fixed inset-x-0 bottom-20 z-toast mx-auto flex max-w-md flex-wrap items-center gap-2 rounded-tile bg-deck px-4 py-3"
        >
          <p className="text-ink">Install PlayHubPlace on this device?</p>
          <button type="button" data-install="yes" className="inline-flex min-h-tap items-center rounded-button bg-play px-4 text-night">
            Install
          </button>
          <button type="button" data-install="no" className="inline-flex min-h-tap items-center rounded-button bg-raised px-4 text-ink">
            Not now
          </button>
        </div>
      </body>
    </html>
  );
}
