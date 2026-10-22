const {chromium,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(pathToFileURL(path.resolve('docs/vendor-creation/report.html')).href);
 await expect(page.locator('details.case')).toHaveCount(54);
 await expect(page.locator('figure img')).toHaveCount(3);
 if(!await page.locator('figure img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)))throw Error('Screenshot load failure');
 await page.locator('#automation').selectOption('Automated now');
 await expect(page.locator('details.case:visible')).toHaveCount(5);
 await page.locator('#automation').selectOption('');
 await page.locator('#search').fill('VC-044');
 await expect(page.locator('details.case:visible')).toHaveCount(1);
 await page.locator('#search').fill('');
 await page.screenshot({path:'docs/vendor-creation/evidence/report-preview.png'});
 await browser.close();console.log('Report verified: 54 cases, 3 screenshots, category/search filters.');
})().catch(e=>{console.error(e.message);process.exit(1)});

