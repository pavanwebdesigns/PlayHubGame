import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/game/prism-match-3d/',
  '/category/puzzle/',
  '/collection/one-thumb/',
  '/new/',
  '/search/',
  '/my-games/',
  '/originals/cps-test/',
  '/originals/reaction-time-test/',
  '/404.html',
];

for (const path of pages) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations).toEqual([]);
  });
}

test('cover is in the first HTML and the iframe is not', async ({ page }) => {
  await page.goto('/game/prism-match-3d/');
  const html = await page.content();
  expect(html).not.toContain('<iframe');
  expect(html).toContain('play.gamepix.com');
  expect(html.toLowerCase()).toContain('fetchpriority="high"');
});

test('two taps reach immersive mode and Back restores home', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1024, 'phone immersive');
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 640));
  const scrolled = await page.evaluate(() => window.scrollY);
  expect(scrolled).toBeGreaterThan(200);
  await page.locator('a.game-tile').filter({ visible: true }).nth(3).click();
  await expect(page).toHaveURL(/\/game\//);
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('[data-immersive="true"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-immersive="true"]')).toHaveCount(0);
  await expect(page).toHaveURL(/\/game\//);
  await expect(page.locator('iframe')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  const restored = await page.evaluate(() => window.scrollY);
  expect(restored).toBeGreaterThan(100);
});

test('a landscape game asks for a sideways phone', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 500, 'portrait phone');
  await page.goto('/game/the-floor-is-lying/');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByText('Turn your phone sideways to play')).toBeVisible();
});

async function tabUntil(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator) {
  for (let step = 0; step < 50; step += 1) {
    const focused = await locator.evaluate((element) => element === document.activeElement);
    if (focused) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Tab did not reach the control');
}

test('tab from home through play, Esc, and Back', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1024, 'phone immersive');
  await page.goto('/');
  const tile = page.locator('a.game-tile').filter({ visible: true }).first();
  await tabUntil(page, tile);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/game\//);
  const play = page.getByRole('button', { name: 'Play' });
  await tabUntil(page, play);
  await page.keyboard.press('Enter');
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('[data-immersive="true"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-immersive="true"]')).toHaveCount(0);
  await expect(page).toHaveURL(/\/game\//);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test('keyboard starts the game', async ({ page }) => {
  await page.goto('/game/drop-planets/');
  await page.getByRole('button', { name: 'Play' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('title', 'Drop Planets game');
});

test('saved and recently played survive a reload', async ({ page }) => {
  await page.goto('/my-games/');
  await page.evaluate(() => {
    localStorage.setItem(
      'ph:recent:v1',
      JSON.stringify([
        { slug: 'prism-match-3d', at: '2026-10-02T00:00:00.000Z' },
      ]),
    );
    localStorage.setItem(
      'playhub_favorites',
      JSON.stringify([
        {
          id: '737HCH',
          title: 'Prism Match 3D',
          namespace: 'prism-match-3d',
          description: '',
          category: 'match-3',
          orientation: 'all',
          quality_score: 1,
          width: 1,
          height: 1,
          date_published: '',
          date_modified: '',
          banner_image: '',
          image: '',
          url: '',
        },
      ]),
    );
  });
  await page.reload();
  await expect(page.getByText('Prism Match 3D')).toBeVisible();
  await page.getByRole('tab', { name: 'Recently played' }).click();
  await expect(page.getByRole('link', { name: 'Prism Match 3D' })).toBeVisible();
});

test('home still opens when storage throws', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'PlayHubPlace' }),
  ).toBeVisible();
});
