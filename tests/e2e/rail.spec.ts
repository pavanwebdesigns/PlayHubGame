import { expect, test } from '@playwright/test';

for (const width of [1024, 1280, 1440]) {
  test(`side rail labels stay on one line at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const rail = page.locator('.side-rail');
    await expect(rail).toBeVisible();
    const wrapped = await rail.locator('.rail-label, .rail-toggle-label').evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const style = getComputedStyle(node);
        const clipped = style.position === 'absolute' && parseFloat(style.width) <= 1;
        if (clipped) return [];
        return node.getClientRects().length > 1 ? [node.textContent ?? ''] : [];
      }),
    );
    expect(wrapped).toEqual([]);
    await page.screenshot({
      path: `tests/e2e/screenshots/rail-${width}.png`,
    });
  });
}
