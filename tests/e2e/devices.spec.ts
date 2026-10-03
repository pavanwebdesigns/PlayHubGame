import { expect, test } from '@playwright/test';

test('immersive play and the sideways prompt', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 500));
  const before = await page.evaluate(() => window.scrollY);
  await page.locator('a.tile').filter({ visible: true }).first().click();
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-immersive="true"]')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  if (before > 0) {
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  }

  await page.goto('/game/the-floor-is-lying/');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByText('Turn your phone sideways to play')).toBeVisible();
});
