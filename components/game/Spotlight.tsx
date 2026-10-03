import { preload } from 'react-dom';
import { buttonClass } from '@/components/ui/Button';
import { CoverImage } from '@/components/game/CoverImage';
import { SPOTLIGHT_SIZES, SPOTLIGHT_WIDTHS } from '@/lib/cover-sizes';
import { spotlightPitch } from '@/config/spotlight';
import { readSpotlightManifest, spotlightFile, spotlightSrcSet } from '@/lib/spotlight-asset';
import type { TileGame } from '@/lib/tile-game';

export function Spotlight({ game }: { game: TileGame }) {
  const pitch = spotlightPitch(game.slug);
  const hosted = readSpotlightManifest();
  const local =
    hosted && hosted.slug === game.slug
      ? {
          avif: spotlightSrcSet(game.slug, hosted.widths, 'avif'),
          webp: spotlightSrcSet(game.slug, hosted.widths, 'webp'),
        }
      : null;
  if (local && hosted) {
    const width = hosted.widths[0];
    if (width) {
      preload(spotlightFile(game.slug, width, 'avif'), {
        as: 'image',
        type: 'image/avif',
        imageSrcSet: local.avif,
        imageSizes: SPOTLIGHT_SIZES,
        fetchPriority: 'high',
      });
    }
  }

  return (
    <div className="spotlight-frame">
      <div className="spotlight-inner p-3 max-md:px-2">
        <CoverImage
          src={game.cover}
          alt=""
          title={game.title}
          coverWidth={game.coverWidth}
          widths={SPOTLIGHT_WIDTHS}
          sizes={SPOTLIGHT_SIZES}
          priority
          local={local}
        />
        <h2 className="mt-3 font-display text-display text-ink">
          {game.title}
        </h2>
        {pitch ? <p className="mt-1 text-ink-muted">{pitch}</p> : null}
        <a
          href={`/game/${game.slug}/`}
          className={`${buttonClass('play', 'lg')} mt-3`}
          data-slug={game.slug}
          data-source="spotlight"
          data-position={0}
        >
          Play
        </a>
      </div>
    </div>
  );
}
