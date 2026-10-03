import { buttonClass } from '@/components/ui/Button';
import { CoverImage } from '@/components/game/CoverImage';
import { spotlightPitch } from '@/config/spotlight';
import type { TileGame } from '@/lib/tile-game';

export function Spotlight({ game }: { game: TileGame }) {
  const pitch = spotlightPitch(game.slug);

  return (
    <div className="spotlight-frame">
      <div className="spotlight-inner p-3">
        <CoverImage
          src={game.cover}
          alt=""
          title={game.title}
          coverWidth={game.coverWidth}
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
        />
        <h2 className="mt-3 font-display text-display text-ink">
          {game.title}
        </h2>
        {pitch ? <p className="mt-1 text-ink-muted">{pitch}</p> : null}
        <a
          href={`/game/${game.slug}/`}
          className={`${buttonClass('play', 'lg')} mt-3`}
        >
          Play
        </a>
      </div>
    </div>
  );
}
