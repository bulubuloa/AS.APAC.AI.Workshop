import { Page, Locator, expect } from '@playwright/test';
import { followLink } from './DealerPages';

/** GAN > Provider User - /provuser/list */
export class ProviderListPage {
  readonly table: Locator;
  readonly rows: Locator;
  readonly userName: Locator;
  readonly dispName: Locator;
  readonly search: Locator;

  constructor(readonly page: Page) {
    this.table = page.locator('#tbMain');
    this.rows = this.table.locator('tbody tr');
    this.userName = page.locator('#frmSearch input[name="userName"]');
    this.dispName = page.locator('#frmSearch input[name="dispName"]');
    this.search = page.locator('#btnSearch');
  }

  async goto() {
    await this.page.goto('/provuser/list');
    await expect(this.table).toBeVisible();
  }

  async searchDisplayName(text: string) {
    await this.dispName.fill(text);
    await this.search.click();
    await expect(this.rows.first()).toBeVisible();
  }

  async openFirst(): Promise<Page> {
    return followLink(this.page, this.rows.first().locator('a[href*="/provuser/edit"]').first());
  }
}

/** /provuser/edit/{id} */
export class ProviderEditPage {
  readonly form: Locator;
  readonly userName: Locator;
  readonly dispName: Locator;
  readonly mobile: Locator;
  readonly groupName: Locator;
  readonly active: Locator;
  readonly isProviderMobile: Locator;
  readonly save: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('#frmMain');
    this.userName = page.locator('#frmMain input[name="userName"]');
    this.dispName = page.locator('#frmMain input[name="dispName"]');
    this.mobile = page.locator('#frmMain input[name="mobile"]');
    this.groupName = page.locator('#provGroupName');
    this.active = page.locator('#frmMain input[name="active"]');
    this.isProviderMobile = page.locator('#frmMain input[name="isProviderMobile"]');
    this.save = page.locator('#btnSave');
  }
}
