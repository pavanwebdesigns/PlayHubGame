import { readdirSync, readFileSync } from 'node:fs';

const reports = readdirSync('.lighthouseci')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(`.lighthouseci/${name}`, 'utf8')))
  .filter((report) => report.categories && report.requestedUrl);

if (reports.length === 0) {
  console.error('No Lighthouse reports found.');
  process.exit(1);
}

let failed = false;
for (const report of reports) {
  const url = new URL(report.requestedUrl);
  const scores = {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    'best-practices': report.categories['best-practices'].score,
    seo: report.categories.seo.score,
  };
  console.log(
    `${url.pathname} performance=${scores.performance} accessibility=${scores.accessibility} best-practices=${scores['best-practices']} seo=${scores.seo}`,
  );
  const cls = report.audits['cumulative-layout-shift']?.numericValue;
  if (
    scores.performance < 0.9 ||
    scores.accessibility < 1 ||
    scores['best-practices'] < 1 ||
    (typeof cls === 'number' && cls > 0.05)
  ) {
    failed = true;
  }
  const indexable = url.pathname === '/';
  if (indexable && scores.seo < 1) failed = true;
  if (!indexable) {
    for (const ref of report.categories.seo.auditRefs) {
      if (ref.id === 'is-crawlable') continue;
      const audit = report.audits[ref.id];
      if (audit && audit.score !== null && audit.score < 1) failed = true;
    }
  }
}

if (failed) {
  console.error('Lighthouse budgets failed.');
  process.exit(1);
}
