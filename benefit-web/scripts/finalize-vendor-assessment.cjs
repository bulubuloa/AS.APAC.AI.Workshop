const fs=require('node:fs');
const file='tests/vendor.spec.ts';
let spec=fs.readFileSync(file,'utf8');
spec=spec.slice(0,spec.indexOf("test('VC-005"))+`test.describe('anonymous', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('VC-005 anonymous visitor cannot open create form', async ({ page }) => {
    await page.goto('/vendors-ver2/add');
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    await expect(page.locator('#vendor_information')).not.toBeVisible();
  });
});
`;
fs.writeFileSync(file,spec);
const mysql=fs.readFileSync('docs/vendor-creation/db-checks.mysql.sql','utf8');
const rsa=fs.readFileSync('docs/vendor-creation/db-checks.rsa.sql','utf8');
if(/\b(insert|update|delete|drop|alter|truncate)\s/i.test(mysql+rsa))throw new Error('Unexpected SQL mutation');
console.log('SQL templates contain no mutation statements.');
