import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl text-ink">Page not found</h1>
        <p className="mt-3 text-ink-muted">That page is not on PlayHubPlace.</p>
        <a
          href="/"
          className="mt-4 inline-flex min-h-11 items-center text-play"
        >
          Back to games
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
