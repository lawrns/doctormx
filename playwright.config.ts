import { defineConfig, devices } from '@playwright/test';

const requestedPort = process.env.PLAYWRIGHT_PORT || '3010';
const requestedPortNumber = Number(requestedPort);
const port =
  /^\d+$/.test(requestedPort) && requestedPortNumber >= 1 && requestedPortNumber <= 65535
    ? requestedPort
    : '3010';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180000,
  },
});
