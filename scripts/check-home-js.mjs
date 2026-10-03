import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Hard ceiling. Measured 3 Oct 2026 after the analytics boot left the home scripts.
 * React and Next are about 130 KB gzip of this, so 120 KB cannot hold the page.
 * The number is the measured total: there is no spare room and no excluded script.
 * The analytics boot is not one of these scripts; it loads only after consent.
 */
export const HOME_JS_BUDGET = 137_192;
/** Measured on 2 Oct 2026. Growth past this needs a home-js: note in the PR. */
export const HOME_JS_BASELINE = 134_029;
export const HOME_JS_GROWTH = 5 * 1024;
/** Home document over the wire. */
export const HOME_HTML_GZIP_MAX = 60 * 1024;
/**
 * Whole out/index.html, RSC flight included. Measured after the sprite,
 * short tile classes, and 12-tile rows.
 * 450 KB cannot hold this page: the shared layout flight is already
 * ~169 KB (the same shell as /privacy/) and each tile is ~3.8 KB once
 * HTML and flight are both counted. Six rows of 12 plus the picks grid
 * land here. The Spotlight srcset adds the 800 step, which is included.
 * The ceiling is that measurement, so the file cannot grow.
 */
export const HOME_HTML_RAW_MAX = 731_623;

export function homeJsGzip(root = 'out') {
  const home = readFileSync(join(root, 'index.html'), 'utf8');
  const scripts = [
    ...home.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g),
  ];
  return scripts.reduce((sum, match) => {
    if (/noModule|nomodule/.test(match[0])) return sum;
    return sum + gzipSync(readFileSync(join(root, match[1]))).length;
  }, 0);
}

export function homeHtmlSize(root = 'out') {
  const raw = readFileSync(join(root, 'index.html'));
  return { decoded: raw.length, gzip: gzipSync(raw).length };
}

/** Inline Next flight (`self.__next_f`), decoded. */
export function homeRscBytes(root = 'out') {
  const home = readFileSync(join(root, 'index.html'), 'utf8');
  let bytes = 0;
  for (const match of home.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    const body = match[1] ?? '';
    if (body.includes('__next_f')) bytes += Buffer.byteLength(body);
  }
  return bytes;
}

const isDirectRun =
  process.argv[1] && process.argv[1].endsWith('check-home-js.mjs');

if (isDirectRun) {
  const html = homeHtmlSize();
  const rsc = homeRscBytes();
  console.log(
    `homeHtml decoded=${html.decoded} gzip=${html.gzip} rsc=${rsc} gzipMax=${HOME_HTML_GZIP_MAX} rawMax=${HOME_HTML_RAW_MAX}`,
  );
  if (html.gzip > HOME_HTML_GZIP_MAX || html.decoded > HOME_HTML_RAW_MAX) {
    console.error(
      `Home HTML is ${html.gzip} bytes gzip and ${html.decoded} bytes decoded. Limits are ${HOME_HTML_GZIP_MAX} gzip and ${HOME_HTML_RAW_MAX} decoded.`,
    );
    process.exit(1);
  }

  const bytes = homeJsGzip();
  const noted = /home-js:/i.test(process.env.PR_BODY ?? '');
  const isPullRequest = process.env.GITHUB_EVENT_NAME === 'pull_request';
  const growthLimit = HOME_JS_BASELINE + HOME_JS_GROWTH;

  console.log(
    `homeJsGzip=${bytes} budget=${HOME_JS_BUDGET} growthLimit=${growthLimit} noted=${noted}`,
  );

  if (bytes > HOME_JS_BUDGET) {
    console.error(
      `Home JS is ${bytes} bytes gzip, above the ${HOME_JS_BUDGET}-byte budget.`,
    );
    process.exit(1);
  }

  if (bytes > growthLimit && isPullRequest && !noted) {
    console.error(
      `Home JS grew past ${growthLimit} bytes. Add a home-js: note to the pull request body, or bring it back down.`,
    );
    process.exit(1);
  }
}
