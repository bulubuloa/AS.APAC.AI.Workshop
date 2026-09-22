/**
 * Login screen of the RSA provider app.
 *
 * The app is Jetpack Compose with no testTags, no resource-ids and no content-descriptions on the
 * fields, so everything is addressed by class, index or visible text. Adding `Modifier.testTag` in
 * ABMR would make all of this stable - see README "Selector findings".
 */
class LoginScreen {
  /** First EditText on the screen. */
  get userName() {
    return $('android=new UiSelector().className("android.widget.EditText").instance(0)');
  }

  /** Second EditText - UiSelector has no password() matcher, so it is addressed by index. */
  get password() {
    return $('android=new UiSelector().className("android.widget.EditText").instance(1)');
  }

  get signIn() {
    return $('android=new UiSelector().text("Sign In")');
  }

  /** Version label under the button, e.g. "2.0.20-uat" - proves which build is under test. */
  get version() {
    return $('android=new UiSelector().textMatches("^[0-9]+\\\\.[0-9]+\\\\.[0-9]+.*")');
  }

  /** The app reports a rejected login in a snackbar/toast; match on any of the wordings. */
  get errorMessage() {
    return $('android=new UiSelector().textContains("incorrect")');
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
