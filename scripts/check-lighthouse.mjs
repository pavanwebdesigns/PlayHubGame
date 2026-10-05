import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * The run whose performance score sits in the middle.
 * Lighthouse CI uses that same median run when numberOfRuns is greater than 1.
 * @param {readonly { categories: { performance: { score: number } }, fetchTime?: string }[]} reports
 */
export function medianReport(reports) {
  if (reports.length === 0) {
    throw new Error('No Lighthouse runs to score.');
  }
  const sorted = reports.toSorted((a, b) => {
    const delta = a.categories.performance.score - b.categories.performance.score;
    if (delta !== 0) return delta;
    return String(a.fetchTime ?? '').localeCompare(String(b.fetchTime ?? ''));
  });
  const picked = sorted[Math.floor(sorted.length / 2)];
  if (!picked) throw new Error('No Lighthouse runs to score.');
  return picked;
}

/** Same budgets as a single run: home performance, accessibility, best practices, CLS, and SEO. */
export function failsBudget(report) {
  const scores = {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    'best-practices': report.categories['best-practices'].score,
    seo: report.categories.seo.score,
  };
  const cls = report.audits['cumulative-layout-shift']?.numericValue;
  if (
    scores.performance < 0.9 ||
    scores.accessibility < 1 ||
    scores['best-practices'] < 1 ||
    (typeof cls === 'number' && cls > 0.05)
  ) {
    return true;
  }
  const pathname = new URL(report.requestedUrl).pathname;
  if (pathname === '/' && scores.seo < 1) return true;
  if (pathname !== '/') {
    for (const ref of report.categories.seo.auditRefs) {
      if (ref.id === 'is-crawlable') continue;
      const audit = report.audits[ref.id];
      if (audit && audit.score !== null && audit.score < 1) return true;
    }
  }
  return false;
}

function loadReports() {
  return readdirSync('.lighthouseci')
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(`.lighthouseci/${name}`, 'utf8')))
    .filter((report) => report.categories && report.requestedUrl);
}

function describe(report) {
  const scores = {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    'best-practices': report.categories['best-practices'].score,
    seo: report.categories.seo.score,
  };
  return `${new URL(report.requestedUrl).pathname} performance=${scores.performance} accessibility=${scores.accessibility} best-practices=${scores['best-practices']} seo=${scores.seo}`;
}

function main() {
  const reports = loadReports();
  if (reports.length === 0) {
    console.error('No Lighthouse reports found.');
    process.exit(1);
  }

  const byPath = new Map();
  for (const report of reports) {
    const pathname = new URL(report.requestedUrl).pathname;
    const group = byPath.get(pathname) ?? [];
    group.push(report);
    byPath.set(pathname, group);
  }

  let failed = false;
  for (const [pathname, runs] of byPath) {
    const ordered = runs.toSorted((a, b) => String(a.fetchTime ?? '').localeCompare(String(b.fetchTime ?? '')));
    ordered.forEach((report, index) => {
      console.log(`${describe(report)} run=${index + 1}/${ordered.length}`);
    });
    const median = medianReport(ordered);
    console.log(`${describe(median)} median`);
    if (failsBudget(median)) {
      failed = true;
      console.error(`${pathname} median is over budget.`);
    }
  }

  if (failed) {
    console.error('Lighthouse budgets failed.');
    process.exit(1);
  }
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(realpathSync(entry)).href) {
  main();
}
