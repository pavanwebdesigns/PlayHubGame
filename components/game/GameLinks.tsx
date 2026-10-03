import type { GameRecord } from '@/lib/catalog/types';

export function GameLinks({ games }: { games: readonly GameRecord[] }) {
  if (games.length === 0) {
    return <p className="text-ink-muted">No games in this list yet.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {games.map((game) => (
        <li key={game.slug}>
          <a
            href={`/game/${game.slug}/`}
            className="flex min-h-11 items-center rounded-tile bg-deck px-3 py-2 text-ink"
          >
            {game.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
