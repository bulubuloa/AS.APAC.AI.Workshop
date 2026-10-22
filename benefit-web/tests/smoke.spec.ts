import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
test('anonymous visitor sees login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Aspire Data Management Tools');
  await new LoginPage(page).expectVisible();
  await expect(page.locator('#blazor-error-ui')).not.toBeVisible();
});
test('password visibility toggles', async ({ page }) => {
  await page.goto('/login');
  const login = new LoginPage(page);
  await login.expectVisible();
  await login.password.fill('visibility-check-only');
  await expect(login.password).toHaveAttribute('type', 'password');
  const toggle = page.locator('form').getByRole('button', { name: 'Icon Button', exact: true });
  await toggle.click();
  await expect(login.password).toHaveAttribute('type', 'text');
  await expect(login.password).toHaveValue('visibility-check-only');
  await toggle.click();
  await expect(login.password).toHaveAttribute('type', 'password');
});
test('forgot password opens and returns to login', async ({ page }) => {
  await page.goto('/login');
  await new LoginPage(page).expectVisible();
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click();
  await expect(page).toHaveURL(/\/forgot-password\/?$/);
  await expect(page.getByRole('button', { name: 'Reset Password', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await new LoginPage(page).expectVisible();
});
for (const route of ['/account', '/dashboard']) {
  test(`anonymous visitor cannot access ${route}`, async ({ page }) => {
    await page.goto(route);
    await new LoginPage(page).expectVisible();
    await expect(page.locator('#blazor-error-ui')).not.toBeVisible();
  });
}
