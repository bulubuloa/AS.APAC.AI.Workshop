import { test, expect } from '@playwright/test';
import { ProviderListPage, ProviderEditPage } from '../pages/ProviderPages';

test.describe('03 Provider User', () => {
  test('TC03.1 provider list loads with the expected columns and rows', async ({ page }) => {
    const list = new ProviderListPage(page);
    await list.goto();
    await list.search.click();

    const headers = await list.table.locator('thead th').allInnerTexts();
    expect(headers.map((h) => h.trim())).toEqual(
      expect.arrayContaining(['Id', 'User name', 'Display name', 'Group name', 'Status']),
    );
    await expect(list.rows.first()).toBeVisible();
    expect(await list.rows.count()).toBeGreaterThan(0);
  });

  test('TC03.2 provider detail opens from the list with matching user and display name', async ({ page }) => {
    const list = new ProviderListPage(page);
    await list.goto();
    await list.search.click();
    await expect(list.rows.first()).toBeVisible();

    const first = list.rows.first();
    const userName = (await first.locator('td:nth-child(3)').innerText()).trim();
    const dispName = (await first.locator('td:nth-child(4)').innerText()).trim();

    const detailPage = await list.openFirst();
    const detail = new ProviderEditPage(detailPage);
    await expect(detail.form).toBeVisible();
    await expect(detail.userName).toHaveValue(userName);
    await expect(detail.dispName).toHaveValue(dispName);
    await expect(detail.isProviderMobile).toBeAttached();
  });
});
