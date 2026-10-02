import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/config/site';
import { LEGACY_GAME_REDIRECT } from '@/lib/legacy-redirect';
import { anekLatin, jersey15 } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | PlayHubPlace',
  },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: '/playlogo.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${anekLatin.variable} ${jersey15.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LEGACY_GAME_REDIRECT }} />
      </head>
      <body>
        <ToastProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-skip focus:bg-play focus:px-3 focus:py-2 focus:text-night"
          >
            Skip to content
          </a>
          <div id="content">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
