import { describe, expect, it } from 'vitest';
import { failsBudget, medianReport } from '../scripts/check-lighthouse.mjs';

function report(pathname: string, performance: number, extra: Record<string, unknown> = {}) {
  return {
    requestedUrl: `http://localhost${pathname}`,
    fetchTime: String(performance),
    categories: {
      performance: { score: performance },
      accessibility: { score: 1 },
      'best-practices': { score: 1 },
      seo: {
        score: 1,
        auditRefs: [{ id: 'is-crawlable' }, { id: 'meta-description' }],
      },
    },
    audits: {
      'cumulative-layout-shift': { numericValue: 0 },
      'is-crawlable': { score: pathname === '/' ? 1 : 0 },
      'meta-description': { score: 1 },
    },
    ...extra,
  };
}

describe('Lighthouse median', () => {
  it('scores the middle performance run', () => {
    const runs = [report('/', 0.84), report('/', 0.95), report('/', 0.91)];
    expect(medianReport(runs).categories.performance.score).toBe(0.91);
    expect(failsBudget(medianReport(runs))).toBe(false);
    expect(failsBudget(runs[0]!)).toBe(true);
  });

  it('keeps the single-run budgets', () => {
    const home = report('/', 0.95);
    home.categories.seo.score = 0.9;
    expect(failsBudget(home)).toBe(true);

    const shifted = report('/search/', 0.97);
    shifted.audits['cumulative-layout-shift'] = { numericValue: 0.06 };
    expect(failsBudget(shifted)).toBe(true);

    const draft = report('/game/prism-match-3d/', 0.99);
    expect(failsBudget(draft)).toBe(false);
    draft.audits['meta-description'] = { score: 0 };
    expect(failsBudget(draft)).toBe(true);
  });
});
