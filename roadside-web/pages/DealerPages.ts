import { Page, Locator, expect } from '@playwright/test';

/** GAN > Client Dealer - /dealer/list */
export class DealerListPage {
  readonly table: Locator;
  readonly rows: Locator;
  readonly client: Locator;
  readonly search: Locator;

  constructor(readonly page: Page) {
    this.table = page.locator('#tbMain');
    this.rows = this.table.locator('tbody tr');
    this.client = page.locator('#frmSearch select[name="clientId"]');
    this.search = page.locator('#btnSearch');
  }

  async goto() {
    await this.page.goto('/dealer/list');
    await expect(this.table).toBeVisible();
  }

  async searchClient(clientId: string) {
    await this.client.selectOption(clientId);
    await this.search.click();
    await expect(this.rows.first()).toBeVisible();
  }

  /** Follows the first row's Edit link; handles same-tab and popup. */
  async openFirst(): Promise<Page> {
    return followLink(this.page, this.rows.first().getByRole('link').first());
  }
}

/** /dealer/edit/{id} */
export class DealerEditPage {
  readonly form: Locator;
  readonly badgeId: Locator;
  readonly name: Locator;
  readonly code: Locator;
  readonly client: Locator;
  readonly reload: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('#frmMain');
    this.badgeId = page.locator('.badge[data-name="dealerId"]');
    this.name = page.locator('#frmMain input[name="dealerName"]');
    this.code = page.locator('#frmMain input[name="dealerCode"]');
    this.client = page.locator('#frmMain select[name="clientId"]');
    this.reload = page.locator('#btnReload');
  }
}

/** Clicks a link and returns the page it landed on (popup when target=_blank). */
export async function followLink(page: Page, link: Locator): Promise<Page> {
  if ((await link.getAttribute('target')) === '_blank') {
    const popup = page.waitForEvent('popup');
    await link.click();
    return popup;
  }
  await link.click();
  return page;
}
