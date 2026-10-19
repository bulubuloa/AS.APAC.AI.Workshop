import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { JobPage } from '../pages/JobPage';
import { ProviderApp } from '../pages/ProviderApp';
import { sideBySide } from '../tools/sideBySide';

// Bangkok; the emulator GPS and the job's incident location are the same point, so the truck is "there"
const LAT = 13.7563;
const LNG = 100.5018;

test('TC-23-001 web creates and dispatches a job; the driver takes, reaches, photographs and finishes it in the app', async ({ browser, baseURL }, testInfo) => {
  ProviderApp.setGps(LAT, LNG);
  const app = await ProviderApp.connect();

  // our own context so the web video is closed and readable before we merge it
  const webStart = Date.now();
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 }, recordVideo: { dir: testInfo.outputPath('web'), size: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept());
  const web = new JobPage(page);
  await app.startRecording();
  const phoneDelay = (Date.now() - webStart) / 1000;

  let jobId = '';
  try {
    const vinId = await test.step('App: driver signed in, truck chosen, Ready switch on', () => app.readyOnDashboard());

    await test.step('Web: agent creates a job at the incident location', async () => {
      await web.login(process.env.RSA_USER!, process.env.RSA_PASSWORD!);
      jobId = await web.createJob(process.env.RSA_TEST_CLIENT_ID ?? '380', process.env.RSA_TEST_PROGRAM ?? 'HOT UAT Program',
        'Basic Repair', `[AUTO-TEST] web+app ${new Date().toISOString().slice(0, 16)}`);
      await web.setCustomerPosition(LAT, LNG);
      testInfo.annotations.push({ type: 'job', description: jobId });
    });

    await test.step(`Web: assign truck ${vinId} and dispatch`, async () => {
      await web.assignTruck(vinId);
      await web.dispatch();
    });

    await test.step('App: the job arrives without a refresh; driver takes it', async () => {
      await app.tap(`recent_job_item_${jobId}`, 90_000);
      await app.tap('job_info_take_job_button');
    });

    await test.step('App: arrive at the destination and enter the customer mileage', async () => {
      await app.tap('job_arriving_target_arrived_button');
      await (await app.el('input_distance_value_input')).waitForDisplayed();
      // no hideKeyboard here: its back-press closes the dialog
      await (await app.el('input_distance_value_input')).setValue('12345');
      await app.tap('input_distance_confirm_button');
    });

    await test.step('App: take a photo with the camera', async () => {
      await app.tap('job_processing_take_photo_button');
      await app.tap('job_photo_fab_button');
      await app.tap('job_photo_take_photo_button');
      await app.tap('com.android.camera2:id/shutter_button');
      await app.tap('com.android.camera2:id/done_button');
      await (await app.el('job_photo_item_0')).waitForDisplayed({ timeout: 60_000 });
      await app.tap('job_photo_back_button');
    });

    await test.step('App: finish the job', async () => {
      await app.tap('job_processing_finish_job_button');
      await app.tap('confirm_finish_job_confirm_button');
      await (await app.el('job_completed_view')).waitForDisplayed({ timeout: 30_000 });
    });

    await test.step('Web: job is closed with the driver\'s timestamps', async () => {
      await web.goto(jobId);
      const m = await web.model();
      expect(m.jobStatus).toBe('CLOSED');
      expect(m.vinId).toBe(vinId);
      expect(m.mileage).toBe(12345);
      for (const k of ['dtRequest', 'dtAccept', 'dtReach', 'dtComplete']) expect(m[k], k).toBeTruthy();
      expect(new Date(m.dtAccept) <= new Date(m.dtReach) && new Date(m.dtReach) <= new Date(m.dtComplete)).toBe(true);
      for (const step of ['ACCEPT', 'REACH', 'COMPLETE']) {
        await expect(web.timestamps.locator('tr', { hasText: step })).toContainText(vinId);
      }
      await web.timestamps.scrollIntoViewIfNeeded();
      await page.waitForTimeout(3_000); // let the final state show in the video
    });
  } finally {
    // evidence even when a step fails
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
      sideBySide(webVideo, phone, merged, phoneDelay);
      await testInfo.attach('web-and-app (side by side).mp4', { path: merged, contentType: 'video/mp4' });
    } catch (e) {
      console.warn('side-by-side merge failed:', (e as Error).message);
    }
  }
});
