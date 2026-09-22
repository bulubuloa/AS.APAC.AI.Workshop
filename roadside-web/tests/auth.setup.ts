import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/** Signs in once and stores the session for every spec in the "msu" project. */
setup('authenticate', async ({ page }) => {
  const user = process.env.RSA_USER;
  const password = process.env.RSA_PASSWORD;
  expect(user && password, 'set RSA_USER and RSA_PASSWORD in .env').toBeTruthy();

  const login = new LoginPage(page);
  await login.goto();
  await login.login(user!, password!);
  await expect(page).toHaveURL(/\/msu\/joblst/);
  await page.context().storageState({ path: 'auth/state.json' });
});
