import { SITE_NAME } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'PlayHubPlace is a free site for browser games embedded from GamePix.',
  path: '/about/',
  index: true,
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">About</h1>
      <p className="text-ink">
        {SITE_NAME} is a free site for playing browser games. The games are
        embedded from GamePix. We do not host the game files ourselves.
      </p>
      <p className="mt-3 text-ink">
        Favorites are saved in this browser only. There are no accounts, and you
        do not need to sign in to play.
      </p>
    </main>
  );
}
