import { SITE_NAME } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cookies',
  description: 'What cookies PlayHubPlace and embedded games may use.',
  path: '/cookies/',
  index: true,
});

// Draft — pending review
export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">Cookies</h1>
      <p className="text-ink">
        {SITE_NAME} does not set its own cookies. Favorites stay in localStorage
        on this device.
      </p>
      <p className="mt-3 text-ink">
        A game embed from GamePix may set cookies inside that frame after you
        choose Play. That is covered by GamePix, not by a cookie we control.
      </p>
    </main>
  );
}
