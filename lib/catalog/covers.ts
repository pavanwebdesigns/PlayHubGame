import { imageSize } from '@/lib/catalog/image-size';
import { mapPool } from '@/lib/catalog/pool';
import { hashString, median, sampleIndexes } from '@/lib/catalog/sample';
import type { CoverSample, GameRecord } from '@/lib/catalog/types';
import { coverAtWidth } from '@/lib/catalog/urls';

export const COVER_SAMPLE_SIZE = 50;
export const COVER_SAMPLE_MIN = 40;

export async function measureCoverSample(
  games: readonly GameRecord[],
  fetchImpl: typeof fetch = fetch,
): Promise<CoverSample> {
  const indexes = sampleIndexes(
    games.length,
    COVER_SAMPLE_SIZE,
    hashString(games.map((game) => game.id).join('\n')),
  );
  const selected = indexes.flatMap((index) => {
    const game = games[index];
    return game ? [game] : [];
  });
  const aspects: number[] = [];

  await mapPool(selected, 5, async (game) => {
    try {
      const response = await fetchImpl(coverAtWidth(game.cover, 64), {
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return;
      const size = imageSize(new Uint8Array(await response.arrayBuffer()));
      if (!size || size.height === 0) return;
      aspects.push(size.width / size.height);
    } catch {
      // One failed cover does not fail the sample. The minimum count does.
    }
  });

  const minimum = Math.min(COVER_SAMPLE_MIN, selected.length);
  if (aspects.length < minimum) {
    throw new Error(
      `Measured ${aspects.length} of ${selected.length} covers. Need at least ${minimum}.`,
    );
  }

  return {
    requested: selected.length,
    measured: aspects.length,
    medianAspect: median(aspects),
    aspects,
  };
}
