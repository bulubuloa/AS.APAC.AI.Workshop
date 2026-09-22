import { Page, Locator, expect } from '@playwright/test';

/** /announcement - pending approvals + all announcements. */
export class AnnouncementListPage {
  readonly createLink: Locator;
  readonly successMessage: Locator;

  constructor(readonly page: Page) {
    this.createLink = page.getByRole('link', { name: /create/i }).first();
    this.successMessage = page.locator('.alert-success');
  }

  async goto() {
    await this.page.goto('/announcement');
    await expect(this.page).toHaveURL(/\/announcement\/?$/i);
  }

  row(title: string): Locator {
    return this.page.locator('table tbody tr', { hasText: title }).first();
  }

  async openDetails(title: string) {
    await this.row(title).locator('a[href*="/details/" i]').first().click();
    await expect(this.page).toHaveURL(/\/announcement\/details\/\d+/i);
  }
}

/** /announcement/create */
export class AnnouncementCreatePage {
  readonly title: Locator;
  readonly priority: Locator;
  readonly content: Locator;
  readonly effectiveDate: Locator;
  readonly expiryDate: Locator;
  readonly saveDraft: Locator;
  readonly submit: Locator;

  constructor(readonly page: Page) {
    this.title = page.locator('#Title');
    this.priority = page.locator('#Priority');
    this.content = page.locator('#Content');
    this.effectiveDate = page.locator('#EffectiveDate');
    this.expiryDate = page.locator('#ExpiryDate');
    this.saveDraft = page.locator('#saveBtn');
    this.submit = page.locator('#submitBtn');
  }

  async goto() {
    await this.page.goto('/announcement/create');
    await expect(this.title).toBeVisible();
  }
}

/** /announcement/details/{id} */
export class AnnouncementDetailsPage {
  readonly heading: Locator;
  readonly title: Locator;
  readonly badges: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Announcement Details' });
    this.title = page.locator('.card-body h3').first();
    this.badges = page.locator('.card-body .badge');
  }
}
