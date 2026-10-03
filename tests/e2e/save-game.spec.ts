import { expect, test } from '@playwright/test';

test('a tile heart saves and removes on the legacy favorites key', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('button[data-save]').filter({ visible: true }).first();
  const slug = await button.getAttribute('data-save');
  const title = await button.getAttribute('data-title');
  expect(slug).toBeTruthy();
  expect(await button.evaluate((element) => element.closest('a') !== null)).toBe(false);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAttribute('aria-label', `Save ${title}`);

  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('aria-label', `Remove ${title} from My games`);
  await expect(page.locator('#ph-toast')).toHaveText('Saved to My games');
  const stored = await page.evaluate(() => localStorage.getItem('playhub_favorites'));
  expect(stored).toContain(`"namespace":"${slug}"`);

  await page.reload();
  const again = page.locator(`button[data-save="${slug}"]`).filter({ visible: true }).first();
  await expect(again).toHaveAttribute('aria-pressed', 'true');
  await again.click();
  await expect(again).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ph-toast')).toHaveText('Removed');
});

test('a tile heart explains when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    const storage = window.localStorage;
    const setItem = storage.setItem.bind(storage);
    storage.setItem = (key: string, value: string) => {
      if (key === 'playhub_favorites') throw new DOMException('blocked');
      setItem(key, value);
    };
  });
  await page.goto('/');
  const button = page.locator('button[data-save]').filter({ visible: true }).first();
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ph-toast')).toHaveText('Saving is not available in this browser.');
});
