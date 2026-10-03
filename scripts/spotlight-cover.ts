import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { spotlightChoice, dayOfYear } from '@/config/spotlight';
import { XL_COVER_MIN } from '@/lib/catalog/cover-widths';
import { loadCurated } from '@/lib/catalog/load';
import { stripQuery } from '@/lib/catalog/urls';
import { buildToday } from '@/lib/build-clock';
import { rankByQuality } from '@/lib/picks';
import { SPOTLIGHT_LOCAL_WIDTHS } from '@/lib/spotlight-asset';

const dir = 'public/spotlight';

async function main(): Promise<void> {
  const games = loadCurated();
  const now = buildToday();
  const available = new Set(games.map((game) => game.slug));
  const lowRes = new Set(
    games
      .filter((game) => (game.coverWidth ?? 0) < XL_COVER_MIN)
      .map((game) => game.slug),
  );
  const choice = spotlightChoice(available, dayOfYear(now), lowRes);
  const game =
    games.find((item) => item.slug === choice.slug) ??
    rankByQuality(games).find((item) => (item.coverWidth ?? 0) >= XL_COVER_MIN);
  if (!game) throw new Error('No Spotlight game to self-host.');
  const source = stripQuery(game.cover);
  if (!source) throw new Error(`Spotlight cover URL is not usable: ${game.cover}`);

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Spotlight cover download failed (${response.status}) for ${game.slug}.`);
  }
  const input = Buffer.from(await response.arrayBuffer());
  const meta = await sharp(input).metadata();
  const natural = meta.width ?? game.coverWidth ?? 0;
  const widths = SPOTLIGHT_LOCAL_WIDTHS.filter((width) => width <= natural);
  if (widths.length === 0) {
    throw new Error(`Spotlight cover for ${game.slug} is narrower than 480.`);
  }

  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (const width of widths) {
    const image = sharp(input).resize({ width, withoutEnlargement: true });
    await writeFile(join(dir, `${game.slug}-${width}.avif`), await image.avif({ quality: 50 }).toBuffer());
    await writeFile(
      join(dir, `${game.slug}-${width}.webp`),
      await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer(),
    );
  }
  await writeFile(
    join(dir, 'manifest.json'),
    JSON.stringify({ slug: game.slug, widths }),
  );
  console.log(`spotlight=${game.slug} widths=${widths.join(',')} source=${natural}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
