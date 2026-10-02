// next/image's client runtime does not fit the home JS budget.
/* eslint-disable @next/next/no-img-element */

import { SITE_NAME } from '@/config/site';
import gamepixLoader from '@/lib/gamepix-loader';

const WIDTHS = [160, 320, 480, 640];

function coverSrc(src: string, width: number): string {
  return gamepixLoader({ src, width });
}

function Fallback({ title, alt }: { title: string; alt: string }) {
  return (
    <span className="cover-fallback">
      <span
        className="cover-title line-clamp-2 w-full min-w-0 text-ink"
        aria-hidden={alt.length === 0}
      >
        {title}
      </span>
      <span
        className="cover-mark max-w-full truncate text-ui leading-tight text-ink-muted"
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
  priority = false,
}: {
  src: string;
  alt: string;
  title: string;
  sizes: string;
  priority?: boolean;
}) {
  if (src.length === 0) {
    return (
      <span className="cover-frame">
        <Fallback title={title} alt={alt} />
      </span>
    );
  }

  return (
    <span className="cover-frame">
      <img
        src={coverSrc(src, 480)}
        srcSet={WIDTHS.map((width) => `${coverSrc(src, width)} ${width}w`).join(', ')}
        sizes={sizes}
        alt={alt}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="cover-img absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}
