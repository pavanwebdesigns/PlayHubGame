import { CONTACT_EMAIL, SITE_NAME } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'How PlayHubPlace handles data stored in your browser.',
  path: '/privacy/',
  index: true,
});

// Draft — pending review
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">Privacy policy</h1>
      <p className="text-ink">
        {SITE_NAME} does not ask you to create an account. Game favorites are
        stored in this browser with localStorage, under the key
        playhub_favorites. That data stays on your device. We do not run a
        server that collects it.
      </p>
      <p className="mt-3 text-ink">
        When you open a game, the embed loads from GamePix. GamePix may use its
        own cookies or storage inside that frame. Their policy applies to that
        embed.
      </p>
      <p className="mt-3 text-ink">{CONTACT_EMAIL}</p>
      <p className="mt-3">
        <a
          className="inline-flex min-h-tap items-center text-play"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          Email us
        </a>
      </p>
    </main>
  );
}
