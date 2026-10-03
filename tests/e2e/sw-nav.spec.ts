import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { extname, join } from 'node:path';
import { expect, test } from '@playwright/test';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
};

const STALE = Buffer.from(
  '<!doctype html><html><head><title>Old</title></head><body><h1 id="stale">Old site</h1></body></html>',
);

function sendStatic(pathname: string, response: ServerResponse): void {
  const relative = pathname.replace(/^\/+/, '');
  if (relative.includes('..')) {
    response.writeHead(404);
    response.end('missing');
    return;
  }
  const file = join('out', relative.endsWith('/') ? `${relative}index.html` : relative);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end('missing');
    return;
  }
  response.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  response.end(readFileSync(file));
}

function originOf(server: Server): string {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('The test server has no port.');
  return `http://127.0.0.1:${address.port}`;
}

function listen(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test('an online navigation does not serve stale HTTP-cached HTML', async ({ page }) => {
  const realHome = readFileSync('out/index.html');
  let stale = true;
  let homeHits = 0;
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    if (pathname === '/' || pathname === '/index.html') {
      homeHits += 1;
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': stale ? 'public, max-age=31536000' : 'no-cache',
      });
      response.end(stale ? STALE : realHome);
      return;
    }
    sendStatic(pathname, response);
  });

  await listen(server);
  const origin = originOf(server);

  try {
    await page.goto(`${origin}/`);
    await expect(page.locator('#stale')).toBeVisible();
    stale = false;

    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'));
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null && navigator.serviceWorker.controller !== null;
    });

    const hitsBeforeReload = homeHits;
    await page.goto(`${origin}/`);
    await expect(page.locator('#stale')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Free online games — play instantly' }),
    ).toBeVisible();
    expect(homeHits).toBeGreaterThan(hitsBeforeReload);
  } finally {
    await close(server);
  }
});

test('a slow online page is shown instead of the offline screen', async ({ page }) => {
  const realHome = readFileSync('out/index.html');
  let delayHome = false;
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    if (pathname === '/' || pathname === '/index.html') {
      const send = () => {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache',
        });
        response.end(realHome);
      };
      if (delayHome) {
        setTimeout(send, 6000);
        return;
      }
      send();
      return;
    }
    sendStatic(pathname, response);
  });

  await listen(server);
  const origin = originOf(server);

  try {
    await page.goto(`${origin}/`);
    await page.evaluate(() => navigator.serviceWorker.register('/sw.js'));
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null && navigator.serviceWorker.controller !== null;
    });

    delayHome = true;
    await page.goto(`${origin}/`);
    await expect(page.getByRole('heading', { level: 1, name: "You're offline" })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Free online games — play instantly' }),
    ).toBeVisible();
  } finally {
    await close(server);
  }
});
