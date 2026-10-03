import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { GameRecord } from '@/lib/catalog/types';
import { toTileGame } from '@/lib/tile-game';

export function writePublicTiles(games: readonly GameRecord[]): void {
  mkdirSync('public/data', { recursive: true });
  const tiles = games.map((game) => toTileGame(game));
  writeFileSync('public/data/tiles.json', `${JSON.stringify(tiles)}\n`);
}

const entry = process.argv[1] ?? '';
if (entry.endsWith('write-tiles.ts')) {
  const games = JSON.parse(readFileSync('data/curated.json', 'utf8')) as GameRecord[];
  writePublicTiles(games);
  console.log(`tiles=${games.length}`);
}
