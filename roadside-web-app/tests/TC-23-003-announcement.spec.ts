import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { JobPage } from '../pages/JobPage';
import { AnnouncementPage } from '../pages/AnnouncementPage';
import { ProviderApp } from '../pages/ProviderApp';
import { sideBySide, captioned, Caption } from '../tools/sideBySide';

const PMWS = process.env.PMWS_BASE_URL || 'https://partner-roadside-uat.aspireasia.net';

test('TC-23-003 admin publishes an announcement on the web; drivers see it in the app; deactivating removes it', async ({ browser, baseURL, request }, testInfo) => {
  // no targeting exists: every UAT provider app sees this, so it is tagged and always switched off at the end
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const TITLE = `[AUTO-TEST] Road closure Rama IV ${stamp}`;
  const CONTENT = 'Rama IV Rd closed between Sam Yan and Lumphini 22:00-05:00. Use Rama I or Sukhumvit. (Automated test - ignore)';
  const tomorrow = new Date(Date.now() + 24 * 3600_000);

  const app = await ProviderApp.connect();
  const webStart = Date.now();
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 }, recordVideo: { dir: testInfo.outputPath('web'), size: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept());
  const ann = new AnnouncementPage(page);
  await app.startRecording();
  const phoneDelay = (Date.now() - webStart) / 1000;
  const captions: Caption[] = [];
  const step = captioned(webStart, captions, (t, b) => test.step(t, b));

  const feed = async () => {
    const r = await request.get(`${PMWS}/api/pmws/announcements?tzOffsetMinutes=420`);
    expect(r.ok()).toBe(true);
    return JSON.stringify(await r.json());
  };
  const titleOnPhone = () => app.d.$(`android=new UiSelector().resourceId("announcement_card_title_text").textContains("${stamp}")`);

  let id = '';
  let active = false;
  try {
    await step('App: driver signed in, on the dashboard', () => app.readyOnDashboard());

    await step('Web: admin creates a High announcement and publishes it', async () => {
      await new JobPage(page).login(process.env.RSA_USER!, process.env.RSA_PASSWORD!);
      id = await ann.create(TITLE, CONTENT, 'High', tomorrow);
      active = true;
      testInfo.annotations.push({ type: 'announcement id', description: id });
    });

    await step('Web: the list shows it Approved and Active', async () => {
      await ann.openList();
      const row = ann.row(TITLE);
      await expect(row).toContainText('Approved');
      await expect(row).toContainText('Active');
      await expect(row).toContainText('High');
    });

    await step('Server: the mobile feed now contains it', async () => {
      expect(await feed()).toContain(TITLE);
    });

    await step('App: News tab shows the announcement; tapping shows the content', async () => {
      await app.tap('main_nav_announcements_tab');
      await (await titleOnPhone()).waitForDisplayed({ timeout: 60_000 });
      await (await titleOnPhone()).click();
      const content = await app.d.$(`android=new UiSelector().resourceId("announcement_card_content_text").textContains("Sam Yan")`);
      await content.waitForDisplayed({ timeout: 15_000 });
      await app.d.pause(2_000);
    });

    await step('App: Home shows the high-priority banner', async () => {
      await app.tap('main_nav_home_tab');
      await (await app.el('home_announcement_badge')).waitForDisplayed({ timeout: 30_000 });
      // other High rows on shared UAT can come first; ours is the newest, so it should lead
      expect.soft(await app.text('home_announcement_badge_title_text')).toContain(stamp);
      await app.d.pause(2_000);
    });

    await step('Web: admin deactivates it', async () => {
      await ann.deactivate(id);
      active = false;
      expect(await feed()).not.toContain(TITLE);
    });

    await step('App: News tab no longer shows it', async () => {
      // the list reloads each time the tab is opened
      await app.d.waitUntil(async () => {
        await app.tap('main_nav_home_tab');
        await app.tap('main_nav_announcements_tab');
        await app.d.pause(3_000);
        return !(await (await titleOnPhone()).isExisting());
      }, { timeout: 60_000, interval: 1_000 });
      await app.tap('main_nav_home_tab');
    });
  } finally {
    if (id && active) await ann.deactivate(id).catch((e) => console.warn(`announcement ${id} left active:`, e.message));
    const phone = testInfo.outputPath('phone.mp4');
    writeFileSync(phone, await app.stopRecording().catch(() => Buffer.alloc(0)));
    await app.close();
    const video = page.video();
    await context.close();
    const webVideo = await video!.path();
    await testInfo.attach('web.webm', { path: webVideo, contentType: 'video/webm' });
    await testInfo.attach('phone.mp4', { path: phone, contentType: 'video/mp4' });
    const merged = testInfo.outputPath('web-and-app.mp4');
    try {
      await testInfo.attach('steps.json', { body: JSON.stringify(captions, null, 1), contentType: 'application/json' });
      sideBySide(webVideo, phone, merged, phoneDelay, captions);
      await testInfo.attach('web-and-app (side by side).mp4', { path: merged, contentType: 'video/mp4' });
    } catch (e) {
      console.warn('side-by-side merge failed:', (e as Error).message);
    }
  }
});
