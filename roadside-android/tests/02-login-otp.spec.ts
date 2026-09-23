import LoginScreen from '../pages/LoginScreen';
import VehicleScreen from '../pages/VehicleScreen';
import OtpScreen from '../pages/OtpScreen';
import { Ids, byId } from '../pages/ids';

const { latestSmsId, waitForOtp } = require('../tools/pmws-sms');

const USER = process.env.PMWS_USER!;
const PASSWORD = process.env.PMWS_PASSWORD!;
const MOBILE = process.env.PMWS_TEST_MOBILE!;
const PACKAGE = process.env.APP_PACKAGE ?? 'com.aspire.partner.uat';

describe('02 Login with OTP', () => {
  it('TC02.1 sign in, pick a vehicle, confirm the OTP and land on the dashboard', async () => {
    await driver.execute('mobile: clearApp', { appId: PACKAGE });
    await driver.execute('mobile: changePermissions', { appPackage: PACKAGE, action: 'grant', permissions: 'all' });
    await driver.activateApp(PACKAGE);
    await acceptPolicyIfShown();

    // 1. credentials
    await expect(await LoginScreen.isDisplayed()).toBe(true);
    await LoginScreen.login(USER, PASSWORD);

    // 2. vehicle picker
    await VehicleScreen.root.waitForDisplayed({ timeout: 60_000 });
    expect(await VehicleScreen.rows.length).toBeGreaterThan(0);
    await VehicleScreen.selectFirst();

    // 3. request an OTP for the test number; remember what was in wlib.SMS first
    await OtpScreen.root.waitForDisplayed({ timeout: 60_000 });
    const before = await latestSmsId(MOBILE);
    await OtpScreen.requestFor('[AUTO-TEST] driver', MOBILE);

    // 4. read the code back through api/pmws/smslatest instead of a real handset
    const { otp, smsId } = await waitForOtp(MOBILE, before);
    expect(smsId).toBeGreaterThan(before);
    await OtpScreen.submitCode(otp);

    // 5. the app lands on the dashboard
    await driver.waitUntil(async () => (await driver.getCurrentActivity()).includes('MainActivity'), {
      timeout: 60_000,
      timeoutMsg: `still on ${await driver.getCurrentActivity()} after confirming the OTP`,
    });
    await expect($(byId(Ids.home.bottomNav))).toBeDisplayed();
  });
});

/** First run shows the policy/consent screen before login. */
async function acceptPolicyIfShown() {
  const accept = await $(byId(Ids.policy.accept));
  if (await accept.isExisting()) {
    await accept.click();
    await browser.pause(2_000);
  }
}
