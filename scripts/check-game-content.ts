import { readdirSync } from 'node:fs';
import { contentPath, hasContent } from '@/lib/content-gate';
import { readGameContent } from '@/lib/game-content';

const dir = 'content/games';
let count = 0;
try {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.mdx')) continue;
    const slug = name.slice(0, -4);
    if (!hasContent('games', slug)) continue;
    readGameContent(slug);
    count += 1;
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.log('gameContent=0');
    process.exit(0);
  }
  throw error;
}
console.log(`gameContent=${count} ${contentPath('games', '{slug}')}`);
