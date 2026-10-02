import { CONTACT_EMAIL, contactEmailPublished } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'How to contact PlayHubPlace.',
  path: '/contact/',
  index: true,
});

export default function ContactPage() {
  const published = contactEmailPublished();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">Contact</h1>
      {published ? (
        <p className="text-ink">
          Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      ) : (
        <p className="text-ink">The contact address is not published yet.</p>
      )}
    </main>
  );
}
