import { readFileSync } from 'node:fs';

const html = readFileSync('out/index.html', 'utf8');
const match = [
  ...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g),
].find((item) => !/noModule|nomodule/.test(item[0]));
if (!match?.[1]) {
  console.error('Could not find a /_next/static script in out/index.html.');
  process.exit(1);
}
process.stdout.write(match[1]);
