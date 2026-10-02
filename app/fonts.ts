import { Anek_Latin, Jersey_15 } from 'next/font/google';

/** The width axis needs the variable file. UI weights stay between 400 and 700. */
export const anekLatin = Anek_Latin({
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-anek',
});

export const jersey15 = Jersey_15({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-jersey',
});
