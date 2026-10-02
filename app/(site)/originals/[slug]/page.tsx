import { notFound } from 'next/navigation';
import { CpsTest } from '@/components/originals/CpsTest';
import { ReactionTest } from '@/components/originals/ReactionTest';
import { pageMetadata } from '@/lib/seo';

const ORIGINALS = {
  'reaction-time-test': {
    title: 'Reaction Time Test',
    description:
      'Test your reaction time in the browser. A PlayHubPlace original.',
  },
  'cps-test': {
    title: 'CPS Test',
    description:
      'See how many times you can click in 5 seconds. A PlayHubPlace original.',
  },
} as const;

type OriginalSlug = keyof typeof ORIGINALS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ORIGINALS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isOriginal(slug)) return {};
  const page = ORIGINALS[slug];
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/originals/${slug}/`,
    index: true,
  });
}

function isOriginal(slug: string): slug is OriginalSlug {
  return Object.prototype.hasOwnProperty.call(ORIGINALS, slug);
}

export default async function OriginalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isOriginal(slug)) notFound();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {slug === 'reaction-time-test' ? <ReactionTest /> : <CpsTest />}
    </main>
  );
}
