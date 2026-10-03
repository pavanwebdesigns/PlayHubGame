import { notFound } from 'next/navigation';
import { ContentDashboard } from '@/components/dev/ContentDashboard';
import { GameSections } from '@/components/dev/GameSections';
import { PrimitiveSections } from '@/components/dev/PrimitiveSections';
import { pageMetadata } from '@/lib/seo';
import { WithToast } from '@/components/ui/WithToast';

const TOOLS = ['ui', 'content'] as const;
type Tool = (typeof TOOLS)[number];

export const dynamicParams = false;

export function generateStaticParams(): { tool: Tool }[] {
  // An empty list fails `output: 'export'`. Publish deletes out/dev after the build.
  return TOOLS.map((tool) => ({ tool }));
}

function isTool(value: string): value is Tool {
  return (TOOLS as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  if (!isTool(tool)) return {};
  return pageMetadata({
    title: tool === 'ui' ? 'Design system' : 'Content to write',
    description:
      tool === 'ui'
        ? 'Component gallery for PlayHubPlace.'
        : 'Draft and missing game write-ups.',
    path: `/dev/${tool}/`,
    index: false,
  });
}

export default async function DevToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  if (!isTool(tool)) notFound();
  if (tool === 'content') return <ContentDashboard />;
  return (
    <WithToast>
      <main className="mx-auto grid min-w-0 max-w-6xl gap-10 px-4 py-8">
        <h1 className="font-display text-display text-ink">Design system</h1>
        <PrimitiveSections />
        <GameSections />
      </main>
    </WithToast>
  );
}
