'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SITE_NAME } from '@/config/site';

export function CoverImage({
  src,
  alt,
  title,
  sizes,
}: {
  src: string;
  alt: string;
  title: string;
  sizes: string;
}) {
  const [failed, setFailed] = useState(src.length === 0);

  return (
    <span className="cover-frame">
      {failed ? (
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
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
