import { Page, Locator, expect } from '@playwright/test';

const ddmmyyyy = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

/** /announcement - list, create and edit (AnnouncementController). Every announcement goes to all provider apps. */
export class AnnouncementPage {
  constructor(readonly page: Page) {}

  row(title: string): Locator {
    return this.page.locator('table tbody tr', { hasText: title });
  }

  /** Submit as an administrator: R0001 auto-approves at any priority ("Submit & Publish"). Returns the id. */
  async create(title: string, content: string, priority: 'Low' | 'Medium' | 'High', expiry: Date): Promise<string> {
    await this.page.goto('/announcement/create');
    await this.page.fill('#Title', title);
    await this.page.selectOption('#Priority', { label: priority });
    await this.page.fill('#Content', content);
    // typed, not picked: the jQuery datepicker would steal focus in the video
    await this.page.fill('#EffectiveDate', ddmmyyyy(new Date()));
    await this.page.fill('#ExpiryDate', ddmmyyyy(expiry));
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('#submitLabel')).toContainText('Publish');
    await this.page.click('#submitBtn');
    await expect(this.page).toHaveURL(/\/announcement\/?($|\?|index)/i);
    const href = await this.row(title).first().locator('a[href*="/Details/"], a[href*="/details/"]').first().getAttribute('href');
    return href!.split('/').pop()!;
  }

  async openList() {
    await this.page.goto('/announcement');
  }

  /** Untick Active - the row stays Approved but leaves the mobile feed (Delete only works on drafts). */
  async deactivate(id: string) {
    await this.page.goto(`/announcement/edit/${id}`);
    const active = this.page.locator('#IsActive');
    if (await active.isChecked()) await active.uncheck();
    await this.page.click('#submitBtn');
    await this.page.waitForLoadState('networkidle');
  }
}
