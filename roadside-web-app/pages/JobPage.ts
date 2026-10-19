import { Page, Locator, expect } from '@playwright/test';

/** /msu/job - the agent's job form, map toolbar and dispatch controls (selectors as in roadside-web). */
export class JobPage {
  readonly form: Locator;
  readonly save: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('#frmMain');
    this.save = page.locator('#btnSave');
  }

  async login(user: string, password: string) {
    await this.page.goto('/auth/login');
    await this.page.fill('input[name=userName]', user);
    await this.page.fill('input[name=password]', password);
    await this.page.click('#btnSignIn');
    await expect(this.page).toHaveURL(/\/msu\/joblst/);
  }

  async goto(jobId?: string) {
    await this.page.goto(jobId ? `/msu/job/${jobId}` : '/msu/job');
    await expect(this.form).toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  private async choose(name: string, value: string, loads?: string) {
    const done = loads ? this.page.waitForResponse((r) => r.url().includes(loads)) : Promise.resolve();
    await this.page.locator(`#frmMain select[name="${name}"]`).selectOption(value);
    await done;
  }

  private async firstValue(name: string) {
    return (await this.page.locator(`#frmMain select[name="${name}"] option[value]:not([value=""])`).first().getAttribute('value'))!;
  }

  /** client -> program (by name) -> first tier -> first privilege -> service type (by label). */
  async createJob(clientId: string, programName: string, service: string, lastName: string): Promise<string> {
    await this.goto();
    await this.choose('clientId', clientId, 'GetListProgramByClientId');
    const program = await this.page.locator('#frmMain select[name="clientProgram"] option', { hasText: programName }).first().getAttribute('value');
    expect(program, `program "${programName}" not offered for client ${clientId}`).toBeTruthy();
    await this.choose('clientProgram', program!, 'GetListCustomerTierByProgramId');
    await this.choose('ProgramCusTiersBenefit', await this.firstValue('ProgramCusTiersBenefit'), 'GetListPrivilegeByProgramId');
    await this.choose('privilegeIdBenefit', await this.firstValue('privilegeIdBenefit'), 'rendersvctypeoption');
    await this.page.locator('#frmMain select[name="serviceType"]').selectOption({ label: service });
    await this.page.fill('#frmMain input[name="cmFName"]', '[AUTO-TEST]');
    await this.page.fill('#frmMain input[name="cmLName"]', lastName);
    await this.page.fill('#frmMain input[name="cmTel"]', '0800000000');
    await this.save.click();
    await expect(this.page).toHaveURL(/\/msu\/job\/\d{2}JB\d{6}/i, { timeout: 30_000 });
    await this.page.waitForLoadState('networkidle');
    return this.page.url().match(/(\d{2}JB\d{6})/i)![1];
  }

  /** Incident location typed into the map toolbar; saved straight away by the page (setPosition). */
  async setCustomerPosition(lat: number, lng: number) {
    const saved = this.page.waitForResponse((r) => r.url().includes('e=setPosition'));
    await this.page.fill('#cmPos', `${lat} ${lng}`);
    await this.page.click('#btnSetCmMarker');
    expect((await (await saved).json()).success).toBeTruthy();
  }

  /** Load Provider plots every truck; then type the VIN and Select assigns it to the job. */
  async assignTruck(vinId: string) {
    const loaded = this.page.waitForResponse((r) => r.url().includes('/loadvinmarkers/'));
    await this.page.click('#btnLoadProvider');
    await loaded;
    await expect
      .poll(() => this.page.evaluate((v) => !!(window as any).jobApp.nearProvider.getVinMarker(v), vinId), {
        message: `truck ${vinId} is not on the job map - is the app online with Ready on?`,
      })
      .toBe(true);
    const set = this.page.waitForResponse((r) => r.url().includes('e=setVin'));
    await this.page.fill('#s_vinId', vinId);
    await this.page.click('#btnSelectVinId');
    const body = await (await set).json();
    expect(body.success, body.error).toBeTruthy();
    expect(body.jobInfo.vinId).toBe(vinId);
  }

  async dispatch() {
    const set = this.page.waitForResponse((r) => r.url().includes('setRequest=true'));
    await this.page.click('#iconRequest');
    const body = await (await set).json();
    expect(body.success, body.error).toBeTruthy();
    await expect(this.field('dtRequest')).not.toBeEmpty();
  }

  field(name: string): Locator {
    return this.page.locator(`[data-name="job.${name}"]`).first();
  }

  async model(): Promise<Record<string, any>> {
    return this.page.evaluate(() => (window as any).jobApp.options.model);
  }

  get timestamps(): Locator {
    return this.page.locator('#tbJobTimestamp');
  }
}
