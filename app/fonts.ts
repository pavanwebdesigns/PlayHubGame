import localFont from 'next/font/local';
import { Jersey_15 } from 'next/font/google';

/**
 * Weights the UI actually sets: 400 body, 500 buttons and links, 600 the
 * current nav item and "See all". The files are basic Latin plus — ’ “ ” ….
 * The logo and the Spotlight title use Jersey and sit above the fold on a phone,
 * so that file is preloaded too.
 */
export const anekLatin = localFont({
  src: [
    { path: './files/anek-400.woff2', weight: '400', style: 'normal' },
    { path: './files/anek-500.woff2', weight: '500', style: 'normal' },
    { path: './files/anek-600.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-anek',
  preload: true,
});

export const jersey15 = Jersey_15({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
  variable: '--font-jersey',
});
