import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Accessibility Tests
 *
 * This configuration extends the main config with settings specifically
 * for running WCAG 2.1 AA accessibility tests.
 */

export default defineConfig({
  // Test directory for accessibility tests
  testDir: './tests/a11y',

  // Test files to run
  testMatch: '**/*.spec.ts',

  // Timeout per test (accessibility tests may take longer)
  timeout: 60 * 1000,

  // Expect timeout
  expect: {
    timeout: 10000
  },

  // Run accessibility tests sequentially to avoid resource contention
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-a11y-report' }],
    ['json', { outputFile: 'test-results-a11y.json' }],
    ['junit', { outputFile: 'junit-results-a11y.xml' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3002',

    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser context options
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',

    // Action timeout
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for accessibility testing
  projects: [
    {
      name: 'chromium-a11y',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile accessibility testing
    {
      name: 'mobile-a11y',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev -- -p 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results-a11y',
});
