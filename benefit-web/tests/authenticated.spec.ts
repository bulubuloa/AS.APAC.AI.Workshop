import { test, expect } from '@playwright/test';
test('saved session opens account', async ({ page }) => {
  await page.goto('/account');
  await expect(page.getByText('Manage your account', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('Profile Details', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In', exact: true })).not.toBeVisible();
  await expect(page.locator('#blazor-error-ui')).not.toBeVisible();
});

