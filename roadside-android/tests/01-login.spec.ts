import LoginScreen from '../pages/LoginScreen';
import { Ids, byId } from '../pages/ids';

const USER = process.env.PMWS_USER!;
const PASSWORD = process.env.PMWS_PASSWORD!;
const PACKAGE = process.env.APP_PACKAGE ?? 'com.aspire.partner.uat';

describe('01 Login', () => {
  beforeEach(async () => {
    // a successful login is remembered, so wipe app data - otherwise the next test lands on the dashboard
    await driver.execute('mobile: clearApp', { appId: PACKAGE });
    // clearApp also revokes the runtime permissions autoGrantPermissions gave us at session start
    await driver.execute('mobile: changePermissions', { appPackage: PACKAGE, action: 'grant', permissions: 'all' });
    await driver.activateApp(PACKAGE);
    await acceptPolicyIfShown();
    await expect(await LoginScreen.isDisplayed()).toBe(true);
  });

  it('TC01.1 valid credentials leave the login screen', async () => {
    await LoginScreen.login(USER, PASSWORD);

    // the app navigates away from LoginActivity on success
    await driver.waitUntil(async () => !(await driver.getCurrentActivity()).includes('LoginActivity'), {
      timeout: 60_000,
      timeoutMsg: `still on ${await driver.getCurrentActivity()} - login did not go through`,
    });
    await expect(await LoginScreen.signIn.isExisting()).toBe(false);
  });

  it('TC01.2 a wrong password keeps the user on the login screen', async () => {
    await LoginScreen.login(USER, 'definitely-wrong-password');

    // give the call time to come back, then prove we never left
    await browser.pause(8_000);
    await expect(await driver.getCurrentActivity()).toContain('LoginActivity');
    await expect(await LoginScreen.signIn.isDisplayed()).toBe(true);
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
