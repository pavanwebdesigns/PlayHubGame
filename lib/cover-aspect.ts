import { readFileSync } from 'node:fs';
import { z } from 'zod';

const coverMetaSchema = z.object({
  coverSample: z.object({
    medianAspect: z.number().positive(),
  }),
});

let cached: number | null = null;

/** Median cover width ÷ height measured into data/meta.json. */
export function medianCoverAspect(meta: unknown): number {
  return coverMetaSchema.parse(meta).coverSample.medianAspect;
}

export function coverAspect(): number {
  if (cached !== null) return cached;
  cached = medianCoverAspect(JSON.parse(readFileSync('data/meta.json', 'utf8')));
  return cached;
}
