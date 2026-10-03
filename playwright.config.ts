import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4183',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4183 --directory out',
    url: 'http://127.0.0.1:4183/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'mobile',
      testIgnore: /devices\.spec\.ts|rail\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'desktop',
      testIgnore: /devices\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'iphone',
      testMatch: /devices\.spec\.ts/,
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'android',
      testMatch: /devices\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
  ],
});
