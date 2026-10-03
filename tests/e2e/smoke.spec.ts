import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home, play, and the legacy game link', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Free online games — play instantly' }),
  ).toBeVisible();
  const homeAxe = await new AxeBuilder({ page }).analyze();
  expect(homeAxe.violations).toEqual([]);

  const tile = page.locator('a.tile').filter({ visible: true }).first();
  await expect(tile).toBeVisible();
  const href = await tile.getAttribute('href');
  expect(href).toBeTruthy();
  await tile.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  const gameAxe = await new AxeBuilder({ page }).analyze();
  expect(gameAxe.violations).toEqual([]);

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /sid=LC991/);
  const width = page.viewportSize()?.width ?? 1440;
  if (width <= 1024) {
    await expect(page.locator('[data-immersive="true"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible();
  } else {
    await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();
  }

  await page.goto('/?page=game&game=737HCH');
  await page.waitForURL(/\/game\/prism-match-3d\/$/);
  await page.goto('/?page=game&game=NOT-A-GAME');
  await page.waitForURL(/\/search\/\?q=NOT-A-GAME$/);
});
