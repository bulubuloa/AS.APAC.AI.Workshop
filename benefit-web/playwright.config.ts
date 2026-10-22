import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
export default defineConfig({
  testDir: './tests', workers: 1, fullyParallel: false,
  forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  timeout: 60_000, expect: { timeout: 30_000 }, outputDir: 'test-results',
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'reports/junit.xml' }]],
  use: { ...devices['Desktop Chrome'],
    baseURL: process.env.BENEFIT_BASE_URL ?? 'https://benefit-uat.aspire.net',
    trace: 'on', screenshot: 'on', video: 'on' },
  projects: [
    { name: 'smoke', testMatch: /smoke\.spec\.ts/ },
    { name: 'vendor', testMatch: /vendor\.spec\.ts/, dependencies: ['setup'], use: { storageState: process.env.BENEFIT_STORAGE_STATE ?? 'auth/state.json' } },
    { name: 'creation', testMatch: /(?:creation|creation-ui)\.spec\.ts/, dependencies: ['setup'], use: { storageState: process.env.BENEFIT_STORAGE_STATE ?? 'auth/state.json' } },
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'authenticated', dependencies: ['setup'], testMatch: /authenticated\.spec\.ts/,
      use: { storageState: process.env.BENEFIT_STORAGE_STATE ?? 'auth/state.json' } },
  ],
});



