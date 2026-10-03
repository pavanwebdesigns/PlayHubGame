import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { z } from 'zod';
import { mapPool } from '@/lib/catalog/pool';
import { probeImageUrl } from '@/lib/catalog/probe-image';
import type { GameRecord } from '@/lib/catalog/types';
import { coverAtWidth } from '@/lib/catalog/urls';

/** XL tiles and Spotlight refuse covers narrower than this. */
export const XL_COVER_MIN = 480;

/** Open Graph uses a cover only from this width up. */
export const OG_COVER_MIN = 600;

/** Ask for a width the CDN will not upscale past the source file. */
export const COVER_PROBE_WIDTH = 4096;

export const COVER_FAIL_WARN_RATIO = 0.05;

const widthMapSchema = z.record(z.string(), z.number().int().positive());

export type CoverWidthMeasure = {
  widths: Record<string, number>;
  failed: number;
  attempted: number;
};

function readWidthFile(dir: string): Record<string, number> {
  const names = ['cover-widths.json.gz', 'cover-widths.json'];
  for (const name of names) {
    try {
      const raw =
        name.endsWith('.gz')
          ? gunzipSync(readFileSync(`${dir}/${name}`)).toString('utf8')
          : readFileSync(`${dir}/${name}`, 'utf8');
      const parsed = widthMapSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      // The next candidate path may exist.
    }
  }
  return {};
}

export function loadCoverWidths(dirs: readonly string[]): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const dir of dirs) Object.assign(merged, readWidthFile(dir));
  return merged;
}

export function widthsFromGames(
  games: readonly GameRecord[],
): Record<string, number> {
  const widths: Record<string, number> = {};
  for (const game of games) {
    if (game.coverWidth != null) widths[game.id] = game.coverWidth;
  }
  return widths;
}

export function applyCoverWidths(
  games: readonly GameRecord[],
  widths: Readonly<Record<string, number>>,
): GameRecord[] {
  return games.map((game) => ({
    ...game,
    coverWidth: widths[game.id] ?? null,
  }));
}

export function coverWidthWarning(curated: number, failed: number): string | null {
  if (curated === 0 || failed / curated <= COVER_FAIL_WARN_RATIO) return null;
  const percent = Math.round((failed / curated) * 100);
  return `WARNING: ${failed} of ${curated} curated covers could not be measured (${percent}%). They count as low-res and will be retried on the next build.`;
}

export async function measureMissingCovers(
  games: readonly GameRecord[],
  known: Readonly<Record<string, number>>,
  fetchImpl: typeof fetch = fetch,
): Promise<CoverWidthMeasure> {
  const missing = games.filter((game) => known[game.id] === undefined);
  const widths: Record<string, number> = {};
  let failed = 0;
  await mapPool(missing, 8, async (game) => {
    const size = await probeImageUrl(
      coverAtWidth(game.cover, COVER_PROBE_WIDTH),
      fetchImpl,
    );
    if (size) widths[game.id] = size.width;
    else failed += 1;
  });
  return { widths, failed, attempted: missing.length };
}
