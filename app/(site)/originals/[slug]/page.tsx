import { notFound } from 'next/navigation';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { CpsTest } from '@/components/originals/CpsTest';
import { ReactionTest } from '@/components/originals/ReactionTest';
import { loadContent } from '@/lib/content';
import { isIndexable } from '@/lib/content-gate';
import { pageMetadata } from '@/lib/seo';

const ORIGINALS = ['reaction-time-test', 'cps-test'] as const;
type OriginalSlug = (typeof ORIGINALS)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return ORIGINALS.map((slug) => ({ slug }));
}

function isOriginal(slug: string): slug is OriginalSlug {
  return (ORIGINALS as readonly string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isOriginal(slug)) return {};
  const doc = loadContent('originals', slug);
  return pageMetadata({
    title: doc?.title ?? slug,
    description: doc?.summary ?? 'A PlayHubPlace original.',
    path: `/originals/${slug}/`,
    index: isIndexable('originals', slug),
  });
}

export default async function OriginalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isOriginal(slug)) notFound();
  const doc = loadContent('originals', slug);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-display-sm text-ink">{doc?.title ?? slug}</h1>
      {slug === 'reaction-time-test' ? <ReactionTest /> : <CpsTest />}
      {doc ? (
        <div className="mt-8">
          <ContentBlocks blocks={doc.blocks} />
        </div>
      ) : null}
    </main>
  );
}
