import { remote } from 'webdriverio';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// SMS helper from the Android suite: reads the binding OTP back from api/pmws/smslatest
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { latestSmsId, waitForOtp } = require('../../roadside-android/tools/pmws-sms');

const PACKAGE = process.env.APP_PACKAGE ?? 'com.aspire.partner.uat';
const DEVICE = process.env.ANDROID_DEVICE ?? 'emulator-5554';
const ADB = path.join(process.env.LOCALAPPDATA ?? '', 'Android/Sdk/platform-tools/adb.exe');

type Driver = Awaited<ReturnType<typeof remote>>;

/** The provider app on the local emulator, driven through Appium by its Compose test tags. */
export class ProviderApp {
  private constructor(readonly d: Driver) {}

  static async connect(): Promise<ProviderApp> {
    const d = await remote({
      hostname: '127.0.0.1',
      port: 4723,
      logLevel: 'error',
      capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:udid': DEVICE,
        'appium:appPackage': PACKAGE,
        'appium:appActivity': 'com.aspire.partner.views.login.LoginActivity',
        'appium:autoGrantPermissions': true,
        'appium:appWaitActivity': '*',
        // keep the device binding between runs - a fresh bind costs a real SMS
        'appium:noReset': true,
        'appium:autoLaunch': false,
        'appium:newCommandTimeout': 900,
        'appium:uiautomator2ServerLaunchTimeout': 180_000,
        'appium:adbExecTimeout': 120_000,
      } as WebdriverIO.Capabilities,
    });
    return new ProviderApp(d);
  }

  el(id: string) {
    return this.d.$(`android=new UiSelector().resourceId("${id}")`);
  }

  async tap(id: string, timeout = 30_000) {
    const e = await this.el(id);
    await e.waitForDisplayed({ timeout });
    await e.click();
  }

  async text(id: string) {
    return (await this.el(id)).getText();
  }

  /** Emulator GPS - the app reports it on every poll, and the web map plots the truck there. */
  static setGps(lat: number, lng: number) {
    execFileSync(ADB, ['-s', DEVICE, 'emu', 'geo', 'fix', String(lng), String(lat)]);
  }

  /** Signs in, binds the truck by OTP when needed, and leaves the driver on the dashboard with Ready on. */
  async readyOnDashboard(): Promise<string> {
    await this.d.activateApp(PACKAGE);
    await this.d.pause(3_000);
    // a previous run may have left the app on a job screen
    for (const back of ['job_completed_back_to_main_button', 'map_back_button']) {
      const b = await this.el(back);
      if (await b.isExisting()) { await b.click(); await this.d.pause(2_000); }
    }
    const policy = await this.el('policy_accept_button');
    if (await policy.isExisting()) await policy.click();

    // the login screen flashes before a signed-in app moves to the dashboard
    const home = await this.el('home_view');
    const signedIn = await home.waitForDisplayed({ timeout: 15_000 }).catch(() => false);
    if (!signedIn && (await (await this.el('login_screen')).isExisting())) {
      await (await this.el('login_email_input')).setValue(process.env.PMWS_USER!);
      await (await this.el('login_password_input')).setValue(process.env.PMWS_PASSWORD!);
      await this.d.hideKeyboard().catch(() => {});
      await this.tap('login_sign_in_button');
    }
    const vehicle = await this.d.$('android=new UiSelector().resourceIdMatches(".*vehicle_item_.*")');
    if (await vehicle.waitForDisplayed({ timeout: 8_000 }).catch(() => false)) {
      await vehicle.click();
      await this.bindByOtp();
    }
    await (await this.el('home_view')).waitForDisplayed({ timeout: 60_000 });
    // a job left over from an aborted run keeps the truck busy - finish it first
    if (await (await this.el('welcome_view_job_button')).isExisting()) {
      await this.tap('welcome_view_job_button');
      await this.tap('job_processing_finish_job_button');
      await this.tap('confirm_finish_job_confirm_button');
      await this.tap('job_completed_back_to_main_button');
      await (await this.el('home_view')).waitForDisplayed({ timeout: 30_000 });
    }
    if ((await this.text('ready_switch_status_text')).trim() !== 'On') await this.tap('ready_switch');
    await this.d.waitUntil(async () => (await this.text('ready_switch_status_text')).trim() === 'On', { timeout: 20_000 });
    return (await this.text('welcome_vin_id_text')).trim();
  }

  private async bindByOtp() {
    const mobile = process.env.PMWS_TEST_MOBILE!;
    await (await this.el('otp_driver_name_input')).waitForDisplayed({ timeout: 30_000 });
    const before = await latestSmsId(mobile);
    await (await this.el('otp_driver_name_input')).setValue('[AUTO-TEST] driver');
    await (await this.el('otp_mobile_input')).setValue(mobile);
    await this.d.hideKeyboard().catch(() => {});
    await this.tap('otp_request_button');
    await (await this.el('otp_code_input')).waitForDisplayed({ timeout: 60_000 });
    const { otp } = await waitForOtp(mobile, before);
    await (await this.el('otp_code_input')).setValue(otp);
    await this.d.hideKeyboard().catch(() => {});
    await this.tap('otp_confirm_button');
  }

  async startRecording() {
    await this.d.startRecordingScreen({ timeLimit: '1800', bitRate: '4000000', forceRestart: true } as any);
  }

  /** Returns the phone video as mp4 bytes. */
  async stopRecording(): Promise<Buffer> {
    return Buffer.from(await this.d.stopRecordingScreen(), 'base64');
  }

  async close() {
    await this.d.deleteSession().catch(() => {});
  }
}
