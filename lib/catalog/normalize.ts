import { hubFor } from '@/config/taxonomy';
import { gamePixItemSchema } from '@/lib/catalog/schema';
import { assignUniqueSlugs } from '@/lib/catalog/slugs';
import type { GameRecord } from '@/lib/catalog/types';
import {
  embedUrlWithSid,
  slugFromNamespace,
  stripQuery,
  toIso,
} from '@/lib/catalog/urls';

export type NormalizeResult = {
  catalog: GameRecord[];
  invalidCount: number;
  invalidSamples: string[];
  unmapped: string[];
};

function fail(samples: string[], message: string): void {
  if (samples.length < 10) samples.push(message);
}

export function normalizeFeedItems(items: readonly unknown[]): NormalizeResult {
  const invalidSamples: string[] = [];
  const unmapped = new Set<string>();
  const pending: GameRecord[] = [];
  let invalidCount = 0;

  for (const item of items) {
    const parsed = gamePixItemSchema.safeParse(item);
    if (!parsed.success) {
      invalidCount += 1;
      const id =
        item && typeof item === 'object' && 'id' in item
          ? String(item.id)
          : 'unknown';
      const issue = parsed.error.issues[0];
      const field = issue?.path.join('.') || 'item';
      fail(
        invalidSamples,
        `${id}: ${field}: ${issue?.message ?? 'invalid item'}`,
      );
      continue;
    }

    const game = parsed.data;
    const slug = slugFromNamespace(game.namespace);
    const hub = hubFor(game.category);
    const publishedAt = toIso(game.date_published);
    const updatedAt = toIso(game.date_modified);
    const cover = stripQuery(game.banner_image);
    const icon = stripQuery(game.image);
    const embedUrl = embedUrlWithSid(game.url);

    if (
      !slug ||
      !hub ||
      !publishedAt ||
      !updatedAt ||
      !cover ||
      !icon ||
      !embedUrl
    ) {
      if (!hub) unmapped.add(game.category);
      invalidCount += 1;
      const reason = !hub
        ? `unmapped category ${game.category}`
        : !slug
          ? 'namespace is not a slug'
          : 'dates or urls could not be normalized';
      fail(invalidSamples, `${game.id}: ${reason}`);
      continue;
    }

    pending.push({
      id: game.id,
      slug,
      title: game.title,
      publisherDescription: game.description ?? '',
      rawCategory: game.category,
      hub,
      tags: [game.category],
      orientation: game.orientation,
      quality: game.quality_score,
      publishedAt,
      updatedAt,
      aspect: game.width / game.height,
      coverWidth: null,
      cover,
      icon,
      embedUrl,
    });
  }

  const seen = new Set<string>();
  const unique: GameRecord[] = [];
  for (const game of pending) {
    if (seen.has(game.id)) {
      invalidCount += 1;
      fail(invalidSamples, `${game.id}: duplicate id`);
      continue;
    }
    seen.add(game.id);
    unique.push(game);
  }

  return {
    catalog: assignUniqueSlugs(unique).sort((a, b) =>
      a.slug < b.slug ? -1 : 1,
    ),
    invalidCount,
    invalidSamples,
    unmapped: [...unmapped].sort(),
  };
}
