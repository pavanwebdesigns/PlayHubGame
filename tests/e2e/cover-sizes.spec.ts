import { expect, test, type Page } from '@playwright/test';

test.use({ deviceScaleFactor: 2 });

const viewports = [
  { width: 390, height: 844, rail: null },
  { width: 1024, height: 900, rail: 'true' },
  { width: 1024, height: 900, rail: 'false' },
  { width: 1440, height: 900, rail: 'true' },
  { width: 1440, height: 900, rail: 'false' },
] as const;

async function chosenWidth(page: Page, selector: string): Promise<string | null> {
  const img = page.locator(selector).first();
  if ((await img.count()) === 0) return null;
  const box = await img.boundingBox();
  if (!box || box.width < 8) return null;
  await img.scrollIntoViewIfNeeded();
  await img.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        if (element.complete && element.currentSrc) resolve();
        else {
          element.addEventListener('load', () => resolve(), { once: true });
          element.addEventListener('error', () => resolve(), { once: true });
        }
      }),
  );
  return img.evaluate((element) => {
    const displayed = element.getBoundingClientRect().width;
    const candidates = (element.srcset || '')
      .split(',')
      .map((part) => Number(/ (\d+)w$/.exec(part.trim())?.[1]))
      .filter((width) => width > 0)
      .sort((a, b) => a - b);
    const selected = Number(/[?&]w=(\d+)/.exec(element.currentSrc)?.[1] ?? 0);
    const need = displayed * window.devicePixelRatio;
    const expected = candidates.find((width) => width >= need - 1) ?? candidates.at(-1) ?? 0;
    if (selected === expected) return '';
    return `${element.alt || selector} displayed ${Math.round(displayed)} need ${Math.round(need)} selected ${selected} expected ${expected} candidates ${candidates.join(',')}`;
  });
}

for (const viewport of viewports) {
  test(`cover candidates match the rendered width at ${viewport.width} rail ${viewport.rail ?? 'none'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    if (viewport.rail) {
      await page.locator('.side-rail').evaluate((rail, collapsed) => {
        rail.setAttribute('data-collapsed', collapsed);
      }, viewport.rail);
    }
    const picks = viewport.width < 768 ? '.picks-thumb' : '.picks-wide';
    const checks = [
      '.spotlight-frame img.cover-img',
      `${picks} .tile-xl img.cover-img`,
      `${picks} .game-tile:not(.tile-xl) img.cover-img`,
      '.home-row img.cover-img',
    ];
    const mismatches: string[] = [];
    for (const selector of checks) {
      const result = await chosenWidth(page, selector);
      if (result) mismatches.push(result);
    }
    expect(mismatches).toEqual([]);
    const spotlight = page.locator('.spotlight-frame img.cover-img');
    await expect(spotlight).toHaveAttribute('fetchpriority', 'high');
    await expect(spotlight).toHaveAttribute('loading', 'eager');
  });
}
