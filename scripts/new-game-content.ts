import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadCurated } from '@/lib/catalog/load';
import { contentPath } from '@/lib/content-gate';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  throw new Error('Usage: tsx scripts/new-game-content.ts {slug}');
}

const game = loadCurated().find((item) => item.slug === slug);
if (!game) throw new Error(`No curated game with slug ${slug}`);

const path = contentPath('games', slug);
if (existsSync(path)) throw new Error(`${path} already exists`);

const today = new Date().toISOString().slice(0, 10);
const source = `---
title: ${game.title}
# TODO(Pavan) write a 140-160 character summary after you play
summary: ""
status: draft
author: ""
playedOn: ""
updated: ${today}
tags: []
controls: {"desktop":[],"phone":[]}
faq: []
---

## About

## How to play

## Tips

## Who it's for
`;

mkdirSync('content/games', { recursive: true });
writeFileSync(path, source);
console.log(`Wrote ${path}`);
