// next/image's client runtime does not fit the home JS budget.
/* eslint-disable @next/next/no-img-element */

import { SITE_NAME } from '@/config/site';
import { TILE_WIDTHS } from '@/lib/cover-sizes';
import gamepixLoader from '@/lib/gamepix-loader';
import { requestedCoverWidth } from '@/lib/catalog/urls';

function coverSrc(src: string, width: number, natural: number | null): string {
  return gamepixLoader({ src, width: requestedCoverWidth(width, natural) });
}

function Fallback({ title, alt, silent }: { title: string; alt: string; silent: boolean }) {
  return (
    <span className="cover-fallback" aria-hidden={silent ? true : undefined}>
      <span
        className="cover-title"
        aria-hidden={alt.length === 0}
      >
        {title}
      </span>
      <span
        className="cover-mark"
        aria-hidden="true"
      >
        {SITE_NAME}
      </span>
    </span>
  );
}

export function CoverImage({
  src,
  alt,
  title,
  sizes,
  widths = TILE_WIDTHS,
  coverWidth = null,
  priority = false,
}: {
  src: string;
  alt: string;
  title: string;
  sizes: string;
  widths?: readonly number[];
  coverWidth?: number | null;
  priority?: boolean;
}) {
  const offered = widths.filter((width) => requestedCoverWidth(width, coverWidth) === width);
  const target = offered[offered.length - 1] ?? 160;
  return (
    <span className="cover-frame">
      <Fallback title={title} alt={alt} silent={src.length > 0} />
      {src.length > 0 ? (
        <img
          src={coverSrc(src, target, coverWidth)}
          srcSet={offered
            .map((width) => `${coverSrc(src, width, coverWidth)} ${width}w`)
            .join(', ')}
          sizes={sizes}
          alt={alt}
          data-cover=""
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className="cover-img"
        />
      ) : null}
    </span>
  );
}
