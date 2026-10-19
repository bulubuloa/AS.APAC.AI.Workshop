import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Reuse the two existing suites' git-ignored credentials instead of a third copy.
dotenv.config({ path: '../roadside-web/.env' });
dotenv.config({ path: '../roadside-android/.env' });

export default defineConfig({
  testDir: './tests',
  // one emulator, shared UAT data: strictly serial
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 15 * 60_000,
  expect: { timeout: 15_000 },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.RSA_BASE_URL ?? 'https://roadside-uat.aspireasia.net',
    trace: 'on',
    screenshot: 'on',
  },
});
