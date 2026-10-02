import { SITE_NAME } from '@/config/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of use',
  description: 'The terms for using PlayHubPlace.',
  path: '/terms/',
  index: true,
});

// Draft — pending review
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-3 text-3xl text-ink">Terms of use</h1>
      <p className="text-ink">
        {SITE_NAME} is free to use. Games are provided by their creators through
        GamePix embeds. We can add, remove, or change games without notice.
      </p>
      <p className="mt-3 text-ink">
        Do not use the site to break the law or to attack someone else&apos;s
        computer. The site is offered as it is, without a promise that every
        game will always work.
      </p>
    </main>
  );
}
