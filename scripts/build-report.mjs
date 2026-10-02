import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = 'out';
let files = 0;
let bytes = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else {
      files += 1;
      bytes += stat.size;
    }
  }
}

walk(root);

const home = readFileSync(join(root, 'index.html'), 'utf8');
const scripts = [
  ...home.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g),
].map((match) => ({ src: match[1], tag: match[0] }));
const sizes = scripts.map((script) => {
  const gzip = gzipSync(readFileSync(join(root, script.src))).length;
  return {
    gzip,
    src: script.src,
    modern: !/noModule|nomodule/.test(script.tag),
  };
});
sizes.sort((a, b) => b.gzip - a.gzip);
const modern = sizes
  .filter((item) => item.modern)
  .reduce((sum, item) => sum + item.gzip, 0);
const budget = 120 * 1024;

console.log(`files=${files}`);
console.log(`bytes=${bytes}`);
console.log(`homeJsGzipModern=${modern}`);
console.log(`homeJsBudget=${budget}`);
console.log(modern <= budget ? 'homeJs=within budget' : 'homeJs=over budget');
console.log('largestJs');
for (const item of sizes.slice(0, 5)) {
  console.log(
    `${item.gzip}\t${item.modern ? 'modern' : 'nomodule'}\t${item.src}`,
  );
}
