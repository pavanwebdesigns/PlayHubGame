import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Code and config only. Drafts under content/ must not fail a main build. */
const ROOTS = ['app', 'components', 'config', 'lib', 'scripts'];
const NEEDLE = 'TODO(Pavan)';
/** This file writes the needle into new content files. It is not a config TODO. */
const SKIP = new Set(['scripts/check-todos.ts', 'scripts/new-game-content.ts']);

function walk(dir: string, out: string[]): void {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, out);
      continue;
    }
    if (/\.(ts|tsx|js|mjs|cjs)$/.test(name)) out.push(path);
  }
}

const files: string[] = [];
for (const root of ROOTS) walk(root, files);

const hits = files.filter((file) => {
  const rel = relative(process.cwd(), file);
  if (rel.startsWith('content/') || SKIP.has(rel)) return false;
  return readFileSync(file, 'utf8').includes(NEEDLE);
});
if (hits.length === 0) process.exit(0);

const list = hits.map((file) => relative(process.cwd(), file)).join(', ');
const onMain = process.env.GITHUB_REF === 'refs/heads/main';
if (onMain) {
  console.error(`TODO(Pavan) is still present on main: ${list}`);
  process.exit(1);
}

console.warn(`TODO(Pavan) is still present (warn only off main): ${list}`);
