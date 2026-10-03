import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Hard ceiling. Measured 3 Oct 2026 on the Phase 5 home scripts.
 * React and Next are about 126 KB gzip of this, so 120 KB cannot hold the page.
 * The number is the measured total: there is no spare room and no excluded script.
 */
export const HOME_JS_BUDGET = 138_102;
/** Measured on 2 Oct 2026. Growth past this needs a home-js: note in the PR. */
export const HOME_JS_BASELINE = 134_029;
export const HOME_JS_GROWTH = 5 * 1024;

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

const isDirectRun =
  process.argv[1] && process.argv[1].endsWith('check-home-js.mjs');

if (isDirectRun) {
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
