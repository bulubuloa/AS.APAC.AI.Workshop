import { Ids, byId } from './ids';

/**
 * Login screen of the RSA provider app.
 *
 * Everything is addressed by the test ids the app exposes (ABMR commit b589b43), so the suite
 * survives layout changes and language switches.
 */
class LoginScreen {
  get root() {
    return $(byId(Ids.login.screen));
  }

  get userName() {
    return $(byId(Ids.login.email));
  }

  get password() {
    return $(byId(Ids.login.password));
  }

  get signIn() {
    return $(byId(Ids.login.signIn));
  }

  get loading() {
    return $(byId(Ids.login.loading));
  }

  get version() {
    return $(byId(Ids.login.version));
  }

  get languageButton() {
    return $(byId(Ids.login.language));
  }

  get callBackOffice() {
    return $(byId(Ids.login.callBackOffice));
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
