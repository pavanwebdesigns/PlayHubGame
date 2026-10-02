import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home, play, and the legacy game link', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'PlayHubPlace' }),
  ).toBeVisible();
  const homeAxe = await new AxeBuilder({ page }).analyze();
  expect(homeAxe.violations).toEqual([]);

  await page.getByRole('link', { name: 'Prism Match 3D' }).click();
  await expect(page).toHaveURL(/\/game\/prism-match-3d\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Prism Match 3D' }),
  ).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  const gameAxe = await new AxeBuilder({ page }).analyze();
  expect(gameAxe.violations).toEqual([]);

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /sid=LC991/);
  await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();

  await page.goto('/?page=game&game=737HCH');
  await page.waitForURL(/\/game\/prism-match-3d\/$/);
  await page.goto('/?page=game&game=NOT-A-GAME');
  await page.waitForURL(/\/search\/\?q=NOT-A-GAME$/);
});
