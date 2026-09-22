import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export const BASE_URL = process.env.RSA_BASE_URL ?? 'https://roadside-uat.aspireasia.net';

export default defineConfig({
  testDir: './tests',
  // Shared UAT data: run serially so specs never race on the same job.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  // Evidence for every test, passed or failed: HTML report (with trace viewer), JUnit for CI, JSON for the deck.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    // Login specs run without a stored session
    { name: 'login', testMatch: /login\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    // Everything else reuses the session captured once by auth.setup.ts
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'msu',
      dependencies: ['setup'],
      testIgnore: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'auth/state.json' },
    },
  ],
});
