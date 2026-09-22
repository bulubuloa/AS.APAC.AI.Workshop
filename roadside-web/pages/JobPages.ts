import { Page, Locator, expect } from '@playwright/test';

/** /msu/joblst - the agent job list with its search form and result table. */
export class JobListPage {
  readonly table: Locator;
  readonly rows: Locator;
  readonly search: Locator;
  readonly newJob: Locator;
  readonly jobId: Locator;
  readonly client: Locator;

  constructor(readonly page: Page) {
    this.table = page.locator('#tbMain');
    this.rows = this.table.locator('tbody tr');
    this.search = page.locator('#btnSearch');
    this.newJob = page.locator('#btnNew');
    this.jobId = page.locator('#frmSearch input[name="jobId"]');
    this.client = page.locator('#frmSearch select[name="clientId"]');
  }

  async goto() {
    await this.page.goto('/msu/joblst');
    await expect(this.table).toBeVisible();
  }

  async searchByJobId(jobId: string) {
    await this.jobId.fill(jobId);
    await this.search.click();
    await expect(this.rows.first()).toBeVisible();
  }

  /** The job-id link in the list opens the detail page in a new tab. */
  async openJob(jobId: string): Promise<Page> {
    const popup = this.page.waitForEvent('popup');
    await this.table.getByRole('link', { name: jobId, exact: true }).click();
    return popup;
  }
}

/** /msu/job/{id} (or /msu/job for a new one) - the job detail form. */
export class JobPage {
  readonly form: Locator;
  readonly badgeJobId: Locator;
  readonly client: Locator;
  readonly serviceType: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly mobile: Locator;
  readonly save: Locator;
  readonly track: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('#frmMain');
    this.badgeJobId = page.locator('.badge[data-name="job.jobId"]').first();
    this.client = page.locator('#frmMain select[name="clientId"]');
    this.serviceType = page.locator('#frmMain select[name="serviceType"]');
    this.firstName = page.locator('#frmMain input[name="cmFName"]');
    this.lastName = page.locator('#frmMain input[name="cmLName"]');
    this.mobile = page.locator('#frmMain input[name="cmTel"]');
    this.save = page.locator('#btnSave');
    this.track = page.locator('#btnTrack');
  }

  async goto(jobId?: string) {
    await this.page.goto(jobId ? `/msu/job/${jobId}` : '/msu/job');
    await expect(this.form).toBeVisible();
  }

  /** Picks the first non-blank option; `loads` is the ajax the change handler fires to fill the next select. */
  async pickFirst(select: Locator, loads?: string): Promise<string> {
    const options = select.locator('option[value]:not([value=""])');
    await expect(options.first()).toBeAttached();
    const value = (await options.first().getAttribute('value'))!;
    const done = loads ? this.page.waitForResponse((r) => r.url().includes(loads)) : Promise.resolve();
    await select.selectOption(value);
    await done;
    await expect(select).toHaveValue(value);
    return value;
  }

  /**
   * Fills what the API insists on for a new job: client -> program -> tier -> privilege -> service type.
   * Programs are picked by name (env-specific ids); without a name, the first program with a privilege wins.
   */
  async fillRequiredForNewJob(clientId: string, programName?: string) {
    // the page init also loads the program list; let that settle before touching the cascade
    await this.page.waitForLoadState('networkidle');
    const programs = this.page.waitForResponse((r) => r.url().includes('GetListProgramByClientId'));
    await this.client.selectOption(clientId);
    await programs;

    const program = this.page.locator('#frmMain select[name="clientProgram"]');
    const tier = this.page.locator('#frmMain select[name="ProgramCusTiersBenefit"]');
    const privilege = this.page.locator('#frmMain select[name="privilegeIdBenefit"]');
    const real = 'option[value]:not([value=""])';

    const candidates = programName
      ? [await program.locator('option', { hasText: programName }).first().getAttribute('value')]
      : await program.locator(real).evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
    expect(candidates[0], `program "" not offered for client `).toBeTruthy();

    for (const value of candidates as string[]) {
      const tiers = this.page.waitForResponse((r) => r.url().includes('GetListCustomerTierByProgramId'));
      await program.selectOption(value);
      await tiers;
      await this.pickFirst(tier, 'GetListPrivilegeByProgramId');
      if (await privilege.locator(real).count()) break;
    }
    expect(await privilege.locator(real).count(), 'no program of this client has a privilege on this environment').toBeGreaterThan(0);
    await this.pickFirst(privilege, 'rendersvctypeoption');
    await this.pickFirst(this.serviceType);
  }

  /** Reads a data-name="job.xxx" display cell. */
  field(name: string): Locator {
    return this.page.locator(`[data-name="job.${name}"]`).first();
  }
}
