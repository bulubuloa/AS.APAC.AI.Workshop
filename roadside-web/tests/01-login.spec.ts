import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('01 Login', () => {
  test('TC01.1 valid credentials land on the job list', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.RSA_USER!, process.env.RSA_PASSWORD!);

    await expect(page).toHaveURL(/\/msu\/joblst/);
    await expect(page.locator('#tbMain')).toBeVisible();
  });

  test('TC01.2 wrong password stays on the login page with an error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.RSA_USER!, 'definitely-wrong-password');

    await expect(login.result).toBeVisible();
    await expect(login.result).not.toBeEmpty();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
