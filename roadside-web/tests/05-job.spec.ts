import { test, expect } from '@playwright/test';
import { JobListPage, JobPage } from '../pages/JobPages';

const JOB_ID = process.env.RSA_TEST_JOB_ID ?? '26JB048514';
const CLIENT_ID = process.env.RSA_TEST_CLIENT_ID ?? '380';

test.describe('05 Job', () => {
  test('TC05.1 job list searches a known job id and shows the expected columns', async ({ page }) => {
    const list = new JobListPage(page);
    await list.goto();

    const headers = (await list.table.locator('thead th').allInnerTexts()).map((h) => h.trim());
    expect(headers).toEqual(expect.arrayContaining(['Job Id', 'Status', 'Service', 'Customer', 'Provider']));

    await list.searchByJobId(JOB_ID);
    await expect(list.table.getByRole('link', { name: JOB_ID, exact: true })).toBeVisible();
  });

  test('TC05.2 job detail opens from the list and shows the job header fields', async ({ page }) => {
    const list = new JobListPage(page);
    await list.goto();
    await list.searchByJobId(JOB_ID);

    const detailPage = await list.openJob(JOB_ID);
    const job = new JobPage(detailPage);
    await expect(job.form).toBeVisible();
    await expect(detailPage).toHaveURL(new RegExp(`/msu/job/${JOB_ID}`, 'i'));
    await expect(job.badgeJobId).toHaveText(JOB_ID);
    await expect(job.field('dtInsert')).not.toBeEmpty();
    await expect(job.save).toBeVisible();
    await expect(job.track).toBeVisible();
  });

  test('TC05.3 creating a job assigns a job id and reopens on its detail page', async ({ page }) => {
    // the page reports a rejected save with alert(resp.error) - keep the text for the failure message
    const alerts: string[] = [];
    page.on('dialog', async (d) => { alerts.push(d.message()); await d.dismiss(); });

    const job = new JobPage(page);
    await job.goto();
    await expect(job.badgeJobId).toHaveText('NEW');

    await job.fillRequiredForNewJob(CLIENT_ID, process.env.RSA_TEST_PROGRAM);
    await job.firstName.fill('[AUTO-TEST]');
    await job.lastName.fill(`[AUTO-TEST] Playwright ${new Date().toISOString().slice(0, 16)}`);
    await job.mobile.fill('0800000000');

    // a successful save navigates at once, so read the body inside the event before it is gone
    const saved = new Promise<{ success: boolean; error?: string }>((resolve) =>
      page.on('response', async (r) => {
        if (r.url().includes('/api/msws/job/') && r.request().method() === 'POST') {
          resolve(await r.json().catch(() => ({ success: true })));
        }
      }),
    );
    await job.save.click();
    const body = await saved;
    expect(body.success, `save rejected: ${body.error ?? alerts.join(' | ')}`).toBeTruthy();

    // a new job redirects to /msu/job/{jobId}
    await expect(page).toHaveURL(/\/msu\/job\/\d{2}JB\d{6}/i);
    const newId = page.url().match(/(\d{2}JB\d{6})/i)![1];
    await expect(job.badgeJobId).toHaveText(newId);
    await expect(job.firstName).toHaveValue('[AUTO-TEST]');
  });
});
