import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl text-ink">Page not found</h1>
      <p className="mt-3 text-ink-muted">That page is not on PlayHubPlace.</p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center text-play"
      >
        Back to games
      </Link>
    </main>
  );
}
