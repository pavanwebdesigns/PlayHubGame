import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('gallery has no axe violations and the keyboard paths work', async ({
  page,
}) => {
  await page.goto('/dev/ui/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Design system' }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);

  await page.keyboard.press('/');
  await expect(page.getByLabel('Search games').first()).toBeFocused();

  await page.getByRole('button', { name: 'Open categories' }).click();
  const sheet = page.getByRole('dialog', { name: 'Categories' });
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});
