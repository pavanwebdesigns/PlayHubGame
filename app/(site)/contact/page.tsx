import { CONTACT_EMAIL } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'How to contact PlayHubPlace.',
  path: '/contact/',
  index: true,
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">Contact</h1>
      <p className="text-ink">{CONTACT_EMAIL}</p>
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
