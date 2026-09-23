/**
 * Login screen of the RSA provider app.
 *
 * Addressed by the test ids the app now exposes (Compose testTag surfaced as resource-id).
 * Stable across layout changes and language switches - unlike the class/index/text selectors
 * this file used before the ids existed.
 */
const id = (resourceId: string) => `android=new UiSelector().resourceId("${resourceId}")`;

class LoginScreen {
  get root() {
    return $(id('login_screen'));
  }

  get userName() {
    return $(id('login_email_input'));
  }

  get password() {
    return $(id('login_password_input'));
  }

  get signIn() {
    return $(id('login_sign_in_button'));
  }

  get version() {
    return $(id('login_version_text'));
  }

  get languageButton() {
    return $(id('login_language_button'));
  }

  get callBackOffice() {
    return $(id('login_call_back_office_button'));
  }

  async isDisplayed() {
    return this.signIn.isDisplayed();
  }

  async login(user: string, pass: string) {
    await this.userName.waitForDisplayed();
    await this.userName.setValue(user);
    await this.password.setValue(pass);
    await driver.hideKeyboard().catch(() => {});
    await this.signIn.click();
  }
}

export default new LoginScreen();
