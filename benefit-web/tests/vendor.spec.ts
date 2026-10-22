import { test, expect, type Page } from '@playwright/test';
const folder = 'docs/vendor-creation/evidence';
function vendorName(page: Page) {
  return page.locator('#vendor_information .form-group').filter({
    has: page.locator('label').filter({ hasText: /^\s*Vendor Name\s*\*?\s*$/ }),
  }).locator('input').first();
}
test('VC-001 create form loads and empty Save is disabled', async ({ page }) => {
  await page.goto('/vendors-ver2/add');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.locator('#vendor_information')).toBeVisible();
  await page.screenshot({ path: `${folder}/01-create-vendor.png`, fullPage: true, mask: [page.locator('header'), page.locator('aside')] });
});
test('VC-002 authorized English creation fields become editable', async ({ page }) => {
  await page.goto('/vendors-ver2/add');
  await expect(vendorName(page)).toBeVisible();
  try {
    await expect(vendorName(page)).toBeEnabled();
  } finally {
    await page.screenshot({ path: `${folder}/03-field-readiness.png`, fullPage: true, mask: [page.locator('header'), page.locator('aside')] });
  }
});
test('VC-003 initialization APIs return application success', async ({ page }) => {
  const results: { path: string; status: number; succeeded: unknown }[] = [];
  const pending: Promise<void>[] = [];
  page.on('response', response => {
    const url = new URL(response.url());
    if (!/\/api\/vendors\/(kontenai\/|v2\/get-by-cmsid\/0)/.test(url.pathname)) return;
    pending.push((async () => {
      const body = await response.json();
      results.push({path: url.pathname, status: response.status(), succeeded: body.succeeded ?? body.Succeeded});
    })());
  });
  await page.goto('/vendors-ver2/add');
  await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
  await expect.poll(() => results.length).toBeGreaterThanOrEqual(6);
  await Promise.all(pending);
  expect(results.every(r => r.status === 200 && r.succeeded === true)).toBeTruthy();
  await test.info().attach('initialization-summary', {body: JSON.stringify(results,null,2),contentType:'application/json'});
});
test('VC-004 published CMS lookups and vendor type are reachable', async ({ request }) => {
  const base = 'https://deliver.kontent.ai/225b0999-fce9-02b4-c44b-ed6990faeeaa';
  for (const type of ['vendor_group_list', 'country_list', 'template_generic']) {
    const response = await request.get(`${base}/items`, {
      params: {'system.type':type,limit:'1',depth:'0'},
      headers: {'X-KC-Wait-For-Loading-New-Content':'true'},
    });
    expect(response.status()).toBe(200);
    const body=await response.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].system.type).toBe(type);
  }
});
test.describe('anonymous', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('VC-005 anonymous visitor cannot open create form', async ({ page }) => {
    await page.goto('/vendors-ver2/add');
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.locator('#vendor_information')).not.toBeVisible();
  });
});
