import { Ids, byId } from './ids';

/**
 * Device binding by OTP. One screen, two states:
 *   ReadyToInput  - driver name + mobile, then Request OTP
 *   RequestedOtp  - the code arrives by SMS, then Confirm
 */
class OtpScreen {
  get root() {
    return $(byId(Ids.otp.screen));
  }

  get driverName() {
    return $(byId(Ids.otp.driverName));
  }

  get mobile() {
    return $(byId(Ids.otp.mobile));
  }

  get requestOtp() {
    return $(byId(Ids.otp.request));
  }

  get code() {
    return $(byId(Ids.otp.code));
  }

  get confirm() {
    return $(byId(Ids.otp.confirm));
  }

  get changePhone() {
    return $(byId(Ids.otp.changePhone));
  }

  async isDisplayed() {
    return this.root.isDisplayed();
  }

  async requestFor(driverName: string, mobile: string) {
    await this.driverName.waitForDisplayed({ timeout: 30_000 });
    await this.driverName.setValue(driverName);
    await this.mobile.setValue(mobile);
    await driver.hideKeyboard().catch(() => {});
    // the app enables Request OTP only for a non-blank name and exactly 10 digits (OtpViewModel.isValidPhone),
    // and a disabled Compose button swallows the tap - check it here instead of timing out on the code field
    await expect(this.requestOtp).toBeEnabled();
    await this.requestOtp.click();
    // the screen swaps to the code field once the request comes back
    await this.code.waitForDisplayed({ timeout: 60_000 });
  }

  async submitCode(otp: string) {
    await this.code.setValue(otp);
    await driver.hideKeyboard().catch(() => {});
    await this.confirm.click();
  }
}

export default new OtpScreen();
