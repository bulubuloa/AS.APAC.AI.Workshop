import { test, expect } from '@playwright/test';
import { AnnouncementListPage, AnnouncementCreatePage, AnnouncementDetailsPage } from '../pages/AnnouncementPages';

// One announcement is created as a Draft by TC04.3 and read back by TC04.2 - hence serial.
test.describe.configure({ mode: 'serial' });

const STAMP = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const TITLE = `[AUTO-TEST] ${STAMP} announcement`;
const CONTENT = `[AUTO-TEST] Created by the Playwright smoke suite at ${new Date().toISOString()}. Safe to delete.`;

function ddmmyyyy(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

test.describe('04 Announcement', () => {
  test('TC04.1 announcement list loads with a Create button and the table headers', async ({ page }) => {
    const list = new AnnouncementListPage(page);
    await list.goto();

    await expect(list.createLink).toBeVisible();
    const headers = (await page.locator('table thead th').allInnerTexts()).map((h) => h.trim());
    expect(headers).toEqual(expect.arrayContaining(['Title', 'Priority', 'Status', 'Actions']));
  });

  test('TC04.3 creating a draft announcement shows it in the list', async ({ page }) => {
    const create = new AnnouncementCreatePage(page);
    await create.goto();

    await create.title.fill(TITLE);
    await create.content.fill(CONTENT);
    await create.effectiveDate.fill(ddmmyyyy(new Date()));
    await create.saveDraft.click();

    const list = new AnnouncementListPage(page);
    await expect(page).toHaveURL(/\/announcement\/?$/i);
    await expect(list.successMessage).toBeVisible();
    await expect(list.row(TITLE)).toBeVisible();
    await expect(list.row(TITLE)).toContainText(/draft/i);
  });

  test('TC04.2 announcement detail shows the title, priority and status of the created draft', async ({ page }) => {
    const list = new AnnouncementListPage(page);
    await list.goto();
    await list.openDetails(TITLE);

    const details = new AnnouncementDetailsPage(page);
    await expect(details.heading).toBeVisible();
    await expect(details.title).toHaveText(TITLE);
    await expect(details.badges.filter({ hasText: /draft/i })).toBeVisible();
    await expect(page.getByText(CONTENT)).toBeVisible();
  });
});
