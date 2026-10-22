import { expect, type Page } from '@playwright/test';
export class LoginPage {
  constructor(readonly page: Page) {}
  // MudBlazor labels are not associated with the inputs on UAT.
  get username() { return this.page.locator('form input').nth(0); }
  get password() { return this.page.locator('form input').nth(1); }
  get signIn() { return this.page.getByRole('button', { name: 'Sign In', exact: true }); }
  async expectVisible() {
    await expect(this.signIn).toBeVisible();
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
  }
}
