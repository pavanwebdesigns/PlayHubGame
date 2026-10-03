import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`home heading stays compact at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('Free online games — play instantly');
    const logo = page.locator('header a').first();
    await expect(logo).toHaveText('PlayHubPlace');
    const spotlight = page.locator('.spotlight-frame');
    await expect(spotlight).toBeVisible();
    const box = await spotlight.boundingBox();
    expect(box).not.toBeNull();
    if (width === 390) {
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
    }
    await page.screenshot({
      path: `tests/e2e/screenshots/home-h1-${width}.png`,
    });
  });
}
