import { Page, Locator, expect } from '@playwright/test';

/** /auth/login - the local user/password form (the Okta button is ignored). */
export class LoginPage {
  readonly userName: Locator;
  readonly password: Locator;
  readonly signIn: Locator;
  readonly result: Locator;

  constructor(readonly page: Page) {
    this.userName = page.getByPlaceholder('User name');
    this.password = page.getByPlaceholder('Password');
    this.signIn = page.locator('#btnSignIn');
    this.result = page.locator('#loginResult');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await expect(this.signIn).toBeVisible();
  }

  async login(user: string, password: string) {
    await this.userName.fill(user);
    await this.password.fill(password);
    await this.signIn.click();
  }
}
