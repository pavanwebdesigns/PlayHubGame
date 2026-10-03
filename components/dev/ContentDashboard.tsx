import { HUB_NAMES } from '@/config/taxonomy';
import { loadCurated } from '@/lib/catalog/load';
import { contentStatus } from '@/lib/content-gate';
import { rankByQuality } from '@/lib/picks';

export function ContentDashboard() {
  const games = rankByQuality(loadCurated());
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-title text-ink">Content to write</h1>
      <p className="mt-2 text-ink-muted">
        Curated games by quality. Draft and missing pages stay out of the sitemap.
      </p>
      <table className="mt-6 w-full text-left text-ink">
        <thead>
          <tr className="text-ink-muted">
            <th className="py-2 pr-3">Game</th>
            <th className="py-2 pr-3">Category</th>
            <th className="py-2 pr-3">Quality</th>
            <th className="py-2">Write-up</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.slug} className="border-t border-line">
              <td className="py-2 pr-3">
                <a href={`/game/${game.slug}/`} className="text-play">
                  {game.title}
                </a>
              </td>
              <td className="py-2 pr-3">{HUB_NAMES[game.hub]}</td>
              <td className="py-2 pr-3">{game.quality.toFixed(2)}</td>
              <td className="py-2">{contentStatus('games', game.slug)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
