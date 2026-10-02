'use client';

import Image from 'next/image';
import { useState } from 'react';

export function CoverImage({
  src,
  alt,
  aspect,
  sizes,
}: {
  src: string;
  alt: string;
  aspect: number;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  const ratio = String(aspect > 0 ? aspect : 1.6);

  if (failed) {
    return (
      <span
        className="flex w-full items-center justify-center bg-deck p-3 text-center font-display text-display-xs text-ink"
        style={{ aspectRatio: ratio }}
      >
        {alt}
      </span>
    );
  }

  return (
    <span className="relative block w-full" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
