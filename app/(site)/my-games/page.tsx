import { MyGames } from '@/components/my-games/MyGames';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'My games',
  description: 'Games you saved in this browser on PlayHubPlace.',
  path: '/my-games/',
  index: false,
});

export default function MyGamesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-display-sm text-ink">My games</h1>
      <MyGames />
    </main>
  );
}
