import { GameSections } from '@/components/dev/GameSections';
import { PrimitiveSections } from '@/components/dev/PrimitiveSections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Design system',
  description: 'Component gallery for PlayHubPlace.',
  path: '/dev/ui/',
  index: false,
});

export default function GalleryPage() {
  return (
    <main className="mx-auto grid min-w-0 max-w-6xl gap-10 px-4 py-8">
      <h1 className="font-display text-display text-ink">Design system</h1>
      <PrimitiveSections />
      <GameSections />
    </main>
  );
}
