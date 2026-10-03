import { expect, test } from '@playwright/test';

test('the CPS test still opens when the network is off', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active !== null;
  });
  await page.context().setOffline(true);
  await page.goto('/search/');
  await expect(page.getByRole('heading', { level: 1, name: "You're offline" })).toBeVisible();
  await page.goto('/originals/cps-test/');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});
