import { readFileSync } from 'node:fs';
import { z } from 'zod';

/** Self-hosted Spotlight widths. The GamePix srcset still goes to 1280. */
export const SPOTLIGHT_LOCAL_WIDTHS = [480, 640, 800, 960] as const;

const manifestSchema = z.object({
  slug: z.string().min(1),
  widths: z.array(z.number().int().positive()).min(1),
});

export type SpotlightManifest = z.infer<typeof manifestSchema>;

export function spotlightFile(slug: string, width: number, ext: 'avif' | 'webp'): string {
  return `/spotlight/${slug}-${width}.${ext}`;
}

export function spotlightSrcSet(
  slug: string,
  widths: readonly number[],
  ext: 'avif' | 'webp',
): string {
  return widths.map((width) => `${spotlightFile(slug, width, ext)} ${width}w`).join(', ');
}

/** Written by scripts/spotlight-cover.ts before `next build`. */
export function readSpotlightManifest(): SpotlightManifest | null {
  try {
    const raw: unknown = JSON.parse(readFileSync('public/spotlight/manifest.json', 'utf8'));
    const parsed = manifestSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
