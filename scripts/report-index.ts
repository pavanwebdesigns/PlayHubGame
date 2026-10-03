import { appendFileSync } from 'node:fs';
import { loadCurated } from '@/lib/catalog/load';
import { isIndexable } from '@/lib/content-gate';
import { draftPages, homeIsDraft } from '@/lib/launch-gate';

const games = loadCurated();
const indexable = games.filter((game) => isIndexable('games', game.slug)).length;
console.log(`indexable games ${indexable} / ${games.length}`);

if (process.env.PH_MAIN_BUILD !== '1') process.exit(0);

if (homeIsDraft()) {
  console.error(
    'Home is indexed, but content/pages/home.mdx is still draft. Review it and set status: published before a main build.',
  );
  process.exit(1);
}

const drafts = draftPages();
if (drafts.length === 0) process.exit(0);
const warning = `Draft pages still noindex:\n${drafts.map((path) => `- ${path}`).join('\n')}`;
console.warn(warning);
const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) appendFileSync(summary, `\n${warning}\n`);
