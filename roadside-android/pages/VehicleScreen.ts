import { Ids, byId } from './ids';

/** Vehicle picker shown straight after sign-in - choosing one starts device binding (OTP). */
class VehicleScreen {
  get root() {
    return $(byId(Ids.vehicle.view));
  }

  get list() {
    return $(byId(Ids.vehicle.list));
  }

  /** Every row carries vehicle_item_<vinId>; match the prefix to take whichever is first. */
  get rows() {
    return $$('android=new UiSelector().resourceIdMatches(".*vehicle_item_.*")');
  }

  get firstRow() {
    return $('android=new UiSelector().resourceIdMatches(".*vehicle_item_.*")');
  }

  async isDisplayed() {
    return this.root.isDisplayed();
  }

  async selectFirst() {
    await this.firstRow.waitForDisplayed({ timeout: 30_000 });
    await this.firstRow.click();
  }
}

export default new VehicleScreen();
