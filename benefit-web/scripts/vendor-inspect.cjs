require('dotenv').config();
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const state=JSON.parse(fs.readFileSync('auth/state.json','utf8'));
  const permissions=[];
  for (const origin of state.origins) for (const entry of origin.localStorage) {
    try {
      const value=entry.value.startsWith('"')?JSON.parse(entry.value):entry.value;
      if(typeof value==='string' && value.startsWith('eyJ')) {
        const claims=JSON.parse(Buffer.from(value.split('.')[1],'base64url').toString());
        for(const [key,claim] of Object.entries(claims)) {
          const values=Array.isArray(claim)?claim:[claim];
          for(const v of values) if(typeof v==='string' && /vendor/i.test(v) && /permission/i.test(key)) permissions.push(v);
        }
      }
    } catch {}
  }
  fs.writeFileSync('docs/vendor-creation/evidence/vendor-permissions.json',JSON.stringify(permissions,null,2));
  console.log('Vendor permissions:',JSON.stringify(permissions));
  const browser=await chromium.launch();
  const context=await browser.newContext({storageState:state,viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const network=[]; const tasks=[];
  page.on('response',r=>{const u=new URL(r.url()); if(!/\/api\//.test(u.pathname))return;
    const task=(async()=>{let body;try{body=await r.json()}catch{}
      const data=body?.data??body?.Data;
      network.push({method:r.request().method(),host:u.host,path:u.pathname,query:Object.fromEntries([...u.searchParams].filter(([k])=>/type|field|language/i.test(k))),status:r.status(),succeeded:body?.succeeded??body?.Succeeded??null,dataCount:Array.isArray(data)?data.length:null});})();tasks.push(task);
  });
  await page.goto(new URL('/vendors-ver2/add',process.env.BENEFIT_BASE_URL).href);
  await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible({timeout:60000});
  const fields=await page.locator('.mud-input-control').evaluateAll(els=>els.map(e=>({label:e.querySelector('label')?.textContent?.trim(),disabled:e.querySelector('input,textarea')?.disabled})).filter(e=>e.label));
  fs.writeFileSync('docs/vendor-creation/evidence/form-fields.json',JSON.stringify(fields,null,2));
  console.log('Fields:',JSON.stringify(fields));
  await page.screenshot({path:'docs/vendor-creation/evidence/01-create-vendor.png',fullPage:true,mask:[page.locator('header'),page.locator('aside')]});
  await page.getByRole('button',{name:'Save',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'docs/vendor-creation/evidence/02-save-disabled.png',mask:[page.locator('header'),page.locator('aside')]});
  await Promise.allSettled(tasks);
  fs.writeFileSync('docs/vendor-creation/evidence/network.json',JSON.stringify(network,null,2));
  const cms='https://deliver.kontent.ai/225b0999-fce9-02b4-c44b-ed6990faeeaa';
  const cmsResults=[];
  for(const type of ['vendor_group_list','country_list','template_generic']) {
    const r=await context.request.get(`${cms}/items`,{params:{'system.type':type,limit:'1',depth:'0'},headers:{'X-KC-Wait-For-Loading-New-Content':'true'}});
    const body=await r.json();cmsResults.push({type,status:r.status(),sampleCount:body.items?.length??0,pagination:body.pagination});
  }
  fs.writeFileSync('docs/vendor-creation/evidence/cms-delivery.json',JSON.stringify(cmsResults,null,2));
  console.log('CMS:',JSON.stringify(cmsResults));
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
