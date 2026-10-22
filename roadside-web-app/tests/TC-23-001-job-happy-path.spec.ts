import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { JobPage } from '../pages/JobPage';
import { ProviderApp } from '../pages/ProviderApp';
import { sideBySide, captioned, Caption } from '../tools/sideBySide';

// A real-looking call: the car breaks down on Ratchadamri Rd by Lumphini Park, the tow truck waits ~5 km away at
// Victory Monument and drives there by road (Phaya Thai -> Rama I -> Ratchadamri) after taking the job.
const CUSTOMER: [number, number] = [13.7334, 100.5408];
const ROUTE: [number, number][] = [
  [13.7649, 100.5383], // Victory Monument - truck waits here
  [13.7567, 100.5338], // Phaya Thai
  [13.7517, 100.5316], // Ratchathewi
  [13.7466, 100.5296], // Pathum Wan junction, turn onto Rama I
  [13.7466, 100.5398], // Ratchaprasong, turn onto Ratchadamri
  [13.7400, 100.5402],
  CUSTOMER,
];
const ODOMETER = 48215;

test('TC-23-001 web creates and dispatches a job; the driver takes, reaches, photographs and finishes it in the app', async ({ browser, baseURL }, testInfo) => {
  ProviderApp.setGps(...ROUTE[0]);
  const app = await ProviderApp.connect();

  // our own context so the web video is closed and readable before we merge it
  const webStart = Date.now();
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 }, recordVideo: { dir: testInfo.outputPath('web'), size: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept());
  const web = new JobPage(page);
  await app.startRecording();
  const phoneDelay = (Date.now() - webStart) / 1000;
  const captions: Caption[] = [];
  const step = captioned(webStart, captions, (t, b) => test.step(t, b));

  let jobId = '';
  try {
    const vinId = await step('App: driver signed in, truck chosen, Ready switch on', () => app.readyOnDashboard());

    await step('Web: agent creates a job at the incident location', async () => {
      await web.login(process.env.RSA_USER!, process.env.RSA_PASSWORD!);
      jobId = await web.createJob(process.env.RSA_TEST_CLIENT_ID ?? '380', process.env.RSA_TEST_PROGRAM ?? 'HOT UAT Program',
        'Basic Repair', `Jaidee (web+app ${new Date().toISOString().slice(0, 16)})`, {
          cmLicense: '1กข 2345',
          cmAddr: 'ถ.ราชดำริ หน้าสวนลุมพินี (แยกสารสิน)',
          cmDistrict: 'ปทุมวัน',
          cmProvince: 'กทม.',
          locNote: 'Left lane outbound, hazard lights on, next to the park fence',
          svcCon: 'Engine stalled and will not restart, battery warning light on',
        });
      await web.setCustomerPosition(...CUSTOMER);
      testInfo.annotations.push({ type: 'job', description: jobId });
    });

    await step(`Web: assign truck ${vinId} and dispatch`, async () => {
      await web.assignTruck(vinId);
      await web.dispatch();
    });

    let cardKm = 0;
    await step('App: the job arrives without a refresh, ~5 km away; driver takes it', async () => {
      await (await app.el(`recent_job_item_${jobId}`)).waitForDisplayed({ timeout: 90_000 });
      const dist = await app.text('job_card_distance_text').catch(() => '');
      cardKm = parseFloat(dist.replace(/[^\d.]/g, '')) || 0;
      testInfo.annotations.push({ type: 'distance on the job card', description: dist });
      await app.tap(`recent_job_item_${jobId}`);
      await app.tap('job_info_take_job_button');
    });

    await step('App: the truck drives to the customer (emulator GPS along the road)', () => app.drive(ROUTE));

    await step('App: arrive at the destination and enter the customer mileage', async () => {
      await app.tap('job_arriving_target_arrived_button');
      await (await app.el('input_distance_value_input')).waitForDisplayed();
      // no hideKeyboard here: its back-press closes the dialog
      await (await app.el('input_distance_value_input')).setValue(String(ODOMETER));
      await app.tap('input_distance_confirm_button');
    });

    await step('App: take a photo with the camera', async () => {
      await app.tap('job_processing_take_photo_button');
      await app.tap('job_photo_fab_button');
      await app.tap('job_photo_take_photo_button');
      await app.tap('com.android.camera2:id/shutter_button');
      await app.tap('com.android.camera2:id/done_button');
      await (await app.el('job_photo_item_0')).waitForDisplayed({ timeout: 60_000 });
      await app.tap('job_photo_back_button');
    });

    await step('App: finish the job', async () => {
      await app.tap('job_processing_finish_job_button');
      await app.tap('confirm_finish_job_confirm_button');
      await (await app.el('job_completed_view')).waitForDisplayed({ timeout: 30_000 });
    });

    await step('Web: job is closed with the driver\'s timestamps', async () => {
      await web.goto(jobId);
      const m = await web.model();
      expect(m.jobStatus).toBe('CLOSED');
      expect(m.vinId).toBe(vinId);
      expect(m.mileage).toBe(ODOMETER);
      // the server prices the job from the truck's road distance (Google Directions) - not 0 any more
      testInfo.annotations.push({ type: 'web distanceKm', description: String(m.distanceKm) });
      expect(m.distanceKm, 'road distance truck -> customer').toBeGreaterThan(2);
      expect(cardKm, 'distance shown on the job card').toBeGreaterThan(2);
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
      await testInfo.attach('steps.json', { body: JSON.stringify(captions, null, 1), contentType: 'application/json' });
      sideBySide(webVideo, phone, merged, phoneDelay, captions);
      await testInfo.attach('web-and-app (side by side).mp4', { path: merged, contentType: 'video/mp4' });
    } catch (e) {
      console.warn('side-by-side merge failed:', (e as Error).message);
    }
  }
});
