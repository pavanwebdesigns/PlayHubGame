import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['app', 'components', 'config', 'lib', 'scripts'];
const NEEDLE = 'TODO(Pavan)';

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
  if (relative(process.cwd(), file) === 'scripts/check-todos.ts') return false;
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
