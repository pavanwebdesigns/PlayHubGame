import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['app', 'components', 'config', 'lib'];
const hex =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
const radius =
  /rounded-\[[^\]]*px\]|border-radius:\s*[^;{]*\d+px|borderRadius:\s*['"`][^'"`]*\d+px/;

const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(tsx?|css)$/.test(name)) continue;
    if (path === 'app/globals.css') continue;
    // theme-color is a browser meta value, so it cannot use a CSS variable.
    const text = readFileSync(path, 'utf8').replace(
      /themeColor:\s*['"]#[0-9a-fA-F]+['"]/g,
      'themeColor: token',
    );
    if (hex.test(text)) problems.push(`${path}: hex color`);
    hex.lastIndex = 0;
    if (/font-family\s*:/.test(text)) problems.push(`${path}: font-family`);
    if (radius.test(text)) problems.push(`${path}: px radius`);
  }
}

for (const root of roots) walk(root);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}

console.log('tokens=ok');
