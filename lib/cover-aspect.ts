import { readFileSync } from 'node:fs';
import { z } from 'zod';

const coverMetaSchema = z.object({
  coverSample: z.object({
    medianAspect: z.number().positive(),
  }),
});

let cached: number | null = null;

/** Median cover width ÷ height measured into data/meta.json. */
export function coverAspect(): number {
  if (cached !== null) return cached;
  const meta = coverMetaSchema.parse(
    JSON.parse(readFileSync('data/meta.json', 'utf8')),
  );
  cached = meta.coverSample.medianAspect;
  return cached;
}
