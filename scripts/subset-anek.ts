import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

/**
 * Regenerates app/fonts/anek-400.woff2, anek-500.woff2, and anek-600.woff2.
 * Those files are committed. The site build does not run this.
 *
 * Needs pyftsubset (fontTools). It is not an app dependency and ships nothing
 * to the browser. The weights are the ones the UI sets. The glyph set is basic
 * Latin plus em dash, apostrophe, quotes, and ellipsis.
 */
const weights = [400, 500, 600] as const;
const unicodes = 'U+0020-007E,U+2014,U+2019,U+201C,U+201D,U+2026';
const dir = 'app/fonts';

const css = await fetch(
  'https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600&display=swap',
  { headers: { 'user-agent': 'Mozilla/5.0' } },
).then((response) => {
  if (!response.ok) throw new Error(`Google Fonts CSS failed (${response.status}).`);
  return response.text();
});

mkdirSync(dir, { recursive: true });

for (const weight of weights) {
  const face = css.split('@font-face').find((block) => block.includes(`font-weight: ${weight};`));
  const url = face?.match(/url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`No Anek file for weight ${weight}.`);
  const source = Buffer.from(await (await fetch(url)).arrayBuffer());
  const input = `${dir}/anek-${weight}.source.ttf`;
  const output = `${dir}/anek-${weight}.woff2`;
  writeFileSync(input, source);
  const run = spawnSync(
    'pyftsubset',
    [input, `--unicodes=${unicodes}`, '--flavor=woff2', '--layout-features=', `--output-file=${output}`],
    { stdio: 'inherit' },
  );
  if (run.status !== 0) {
    throw new Error('pyftsubset failed. Install fontTools and brotli, then run this again.');
  }
  rmSync(input);
  console.log(`anek-${weight} written`);
}
