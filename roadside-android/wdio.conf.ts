import 'dotenv/config';
import { mkdirSync } from 'node:fs';


export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  specs: ['./tests/**/*.spec.ts'],
  maxInstances: 1,
  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 180_000 },
  logLevel: 'warn',
  waitforTimeout: 20_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  // The runner starts Appium itself. On machines where the uiautomator2 driver takes longer to
  // load than the service's start timeout, run `npm run appium` in another terminal and set
  // APPIUM_EXTERNAL=1 so this connects to that server instead.
  services: process.env.APPIUM_EXTERNAL
    ? []
    : [['appium', { args: { relaxedSecurity: true }, logPath: './reports' } as any]],
  port: 4723,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE ?? 'emulator-5554',
      'appium:udid': process.env.ANDROID_DEVICE ?? 'emulator-5554',
      'appium:appPackage': process.env.APP_PACKAGE ?? 'com.aspire.partner.uat',
      'appium:appActivity': process.env.APP_ACTIVITY ?? 'com.aspire.partner.views.login.LoginActivity',
      // the app asks for location/notifications on first run - never let a prompt fail a test
      'appium:autoGrantPermissions': true,
      'appium:appWaitActivity': '*',
      'appium:newCommandTimeout': 300,
      'appium:adbExecTimeout': 120_000,
      'appium:uiautomator2ServerLaunchTimeout': 120_000,
      // keep the signed-in state out of the next test
      'appium:noReset': false,
      'appium:fullReset': false,
    },
  ],

  // Evidence for every test, passed or failed (same rule as the web suite).
  reporters: [
    'spec',
    ['junit', { outputDir: './reports', outputFileFormat: (o: any) => `junit-${o.cid}.xml` }],
    [
      'video',
      {
        saveAllVideos: true,
        videoSlowdownMultiplier: 3,
        outputDir: './reports/video',
      },
    ],
  ],

  afterTest: async function (test) {
    // a screenshot per test, passed or failed, named after it and next to the videos
    const dir = './reports/screenshots';
    mkdirSync(dir, { recursive: true });
    const name = `${test.parent} ${test.title}`.replace(/[^a-z0-9]+/gi, '-').slice(0, 120);
    await browser.saveScreenshot(`${dir}/${name}.png`);
  },
};
