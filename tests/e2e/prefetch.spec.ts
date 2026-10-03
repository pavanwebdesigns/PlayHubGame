import { expect, test } from '@playwright/test';

test('a tile prefetches its own page when the pointer arrives', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="prefetch"]')).toHaveCount(0);
  const tile = page.locator('a.tile').filter({ visible: true }).first();
  const href = await tile.getAttribute('href');
  await tile.hover();
  await expect(page.locator(`link[rel="prefetch"][href="${href}"]`)).toHaveCount(1);
  await expect(page.locator('link[rel="prefetch"]')).toHaveCount(1);
});
