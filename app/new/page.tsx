import { GameLinks } from '@/components/game/GameLinks';
import { loadCurated } from '@/lib/catalog/load';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'New games',
  description: 'The newest free browser games on PlayHubPlace.',
  path: '/new/',
  index: true,
});

export default function NewPage() {
  const games = [...loadCurated()]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 100);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-3xl text-ink">New games</h1>
      <GameLinks games={games} />
    </main>
  );
}
