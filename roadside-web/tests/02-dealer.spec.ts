import { test, expect } from '@playwright/test';
import { DealerListPage, DealerEditPage } from '../pages/DealerPages';

const CLIENT_ID = process.env.RSA_TEST_CLIENT_ID ?? '380';

test.describe('02 Client Dealer', () => {
  test('TC02.1 dealer list filters by client and shows the expected columns', async ({ page }) => {
    const list = new DealerListPage(page);
    await list.goto();

    const headers = await list.table.locator('thead th').allInnerTexts();
    expect(headers.map((h) => h.trim())).toEqual(expect.arrayContaining(['Id', 'Client', 'Code', 'Dealer Name']));

    await list.searchClient(CLIENT_ID);
    expect(await list.rows.count()).toBeGreaterThan(0);

    // every row belongs to the selected client; the option label sometimes carries "(380)", the table never does
    const clientName = (await list.client.locator('option:checked').innerText()).replace(/\s*\(\d+\)\s*$/, '').trim();
    for (const cell of await list.rows.locator('td:nth-child(3)').allInnerTexts()) {
      expect(cell.trim()).toBe(clientName);
    }
  });

  test('TC02.2 dealer detail opens from the list with matching code and name', async ({ page }) => {
    const list = new DealerListPage(page);
    await list.goto();
    await list.searchClient(CLIENT_ID);

    const first = list.rows.first();
    const code = (await first.locator('td:nth-child(4)').innerText()).trim();
    const name = (await first.locator('td:nth-child(5)').innerText()).trim();

    const detailPage = await list.openFirst();
    const detail = new DealerEditPage(detailPage);
    await expect(detail.form).toBeVisible();
    await expect(detail.code).toHaveValue(code);
    await expect(detail.name).toHaveValue(name);
    // dealers are CMS-synced: the page is read-only, no Save button
    await expect(detail.reload).toBeVisible();
  });
});
