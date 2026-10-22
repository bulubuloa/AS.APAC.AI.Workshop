import { test, expect, type Page } from '@playwright/test';
import type { Connection } from 'mysql2/promise';
import { readFileSync, existsSync } from 'node:fs';
import { compareVendor, connectBenefitDB, value, type Comparison } from '../helpers/compare-vendor';
const { fillVendor }: { fillVendor: (page: Page, options: {folder:string}) => Promise<any> } = require('../helpers/fill-vendor.cjs');

test('TC-VENDOR-CREATE-001 create vendor and compare BenefitDB with CMS', async ({ page, request, baseURL }, info) => {
  test.setTimeout(240_000);
  const stages = ['Fill creation form in ABF dependency order','Check creation readiness','Verify BenefitDB read access','Save vendor and capture CMSId','Compare BenefitDB and CMS']
    .map(name => ({name,status:'Not run',reason:''}));
  const comparison: Comparison[] = [];
  let connection: Connection | undefined;
  let payload: any, created: any;
  let countries: any[] = [];
  async function step(index: number, action: () => Promise<void>) {
    await test.step(stages[index].name, async () => {
      stages[index].status='Running';
      try { await action(); stages[index].status='Passed'; }
      catch(error:any) {
        stages[index].status=error.message.startsWith('BLOCKED:')?'Blocked':'Failed';
        stages[index].reason=error.message.split('\n')[0];
        if(stages[index].status==='Blocked')info.annotations.push({type:'blocked',description:stages[index].reason});
        throw error;
      }
    });
  }
  try {
    if(!baseURL || !/^benefit-uat\.aspire(?:asia)?\.net$/.test(new URL(baseURL).hostname)) {
      throw new Error('BLOCKED: This creation test targets Benefit UAT only.');
    }
    await info.attach('Test case and comparison specification', {body:readFileSync('docs/vendor-creation/CREATION-TC.md'),contentType:'text/markdown'});
    page.on('response',async response=>{
      if(new URL(response.url()).pathname==='/api/master-data/country') {
        try {const body=await response.json();countries=value(body,'Data')??[];}catch{}
      }
    });
    if(process.env.BENEFIT_REPLAY_CREATED==='1'){
      const prior=JSON.parse(readFileSync('docs/vendor-creation/evidence/saved-run/result.json','utf8'));
      payload=JSON.parse(readFileSync('docs/vendor-creation/evidence/saved-run/payload.json','utf8'));created=prior.created;
      info.annotations.push({type:'replay',description:'Read-only recheck of vendor created in the preceding run; no new vendor created.'});
      for(const index of [0,1,3]){stages[index].status='Passed';stages[index].reason='Verified in original creation run, IDs reused for read-only comparison';}
      await info.attach('Original creation screenshot',{path:'docs/vendor-creation/evidence/saved-run/creation.png',contentType:'image/png'});
      await info.attach('Original creation trace',{path:'docs/vendor-creation/evidence/saved-run/creation-trace.zip',contentType:'application/zip'});
      await info.attach('Original creation video',{path:'docs/vendor-creation/evidence/saved-run/creation-video.webm',contentType:'video/webm'});
      await step(2,async()=>{connection=await connectBenefitDB();});
      await page.goto('/vendors-ver2/add');
      await expect.poll(()=>countries.length,{timeout:30000}).toBeGreaterThan(0);
      await page.goto('/vendors-ver2/'+value(created,'cmsId'));
      await info.attach('Current saved vendor',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
    }else{
    await step(0,async()=>{
      const fill=await fillVendor(page,{folder:info.outputPath('input-evidence')});
      await info.attach('Field-by-field input results',{body:JSON.stringify(fill.results,null,2),contentType:'application/json'});
      await info.attach('Actual retained form values',{body:JSON.stringify(fill.finalFields,null,2),contentType:'application/json'});
      await info.attach('Completed accessible form',{path:info.outputPath('input-evidence/all-fields-populated.png'),contentType:'image/png'});
      const previous='docs/vendor-creation/evidence/full-input/all-fields-populated.png';
      if(existsSync(previous))await info.attach('Previous input run with finalized logo and gallery (reference only)',{path:previous,contentType:'image/png'});
    });
    await step(1,async()=>{
      const disabled = await page.locator('#vendor_information .form-group').evaluateAll(groups => groups
        .filter(group => {const input=group.querySelector('input');return input?.disabled && !/Vendor CMS ID|Vendor ID/.test(group.querySelector('label')?.textContent??'');})
        .map(group=>group.querySelector('label')?.textContent?.replace(/\s+/g,' ').trim()));
      if(disabled.length)throw new Error('BLOCKED: Required Vendor Information inputs remain disabled: '+disabled.join(', '));
      if(await page.getByRole('button',{name:'Save',exact:true}).isDisabled())throw new Error('BLOCKED: Save is disabled; complete category-specific required values and form validation.');
    });
    await step(2,async()=>{
      connection=await connectBenefitDB();
      const env=process.env.BENEFIT_CMS_ENVIRONMENT_ID??'225b0999-fce9-02b4-c44b-ed6990faeeaa';
      if(env!=='225b0999-fce9-02b4-c44b-ed6990faeeaa')throw new Error('BLOCKED: CMS environment must be SIT/UAT.');
    });
    await step(3,async()=>{
      const responsePromise=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/vendors/v2',{timeout:60_000});
      await page.getByRole('button',{name:'Save',exact:true}).click();
      const response=await responsePromise;
      payload=response.request().postDataJSON();
      const body=await response.json();
      expect(response.ok(),'Create HTTP response').toBe(true);
      expect(value(body,'Succeeded'),'Create application result').toBe(true);
      created=value(body,'Data');
      expect(value(created,'Id')).toBeTruthy();
      expect(value(created,'CMSId')).toMatch(/^[0-9a-f-]{36}$/i);
      await info.attach('Created vendor IDs',{body:JSON.stringify({id:value(created,'Id'),cmsId:value(created,'CMSId')},null,2),contentType:'application/json'});
      await info.attach('Submitted synthetic creation payload',{body:JSON.stringify(payload,null,2),contentType:'application/json'});
      await expect(page).toHaveURL(new RegExp(String(value(created,'CMSId'))+'(?:[/?#].*)?$','i'));
      await info.attach('Saved vendor detail',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
    });
    }
    await step(4,async()=>{
      await compareVendor(connection!,request,Number(value(created,'Id')),String(value(created,'CMSId')),payload,countries,comparison);
    });
  } finally {
    if(connection)await connection.end();
    if(!created)for(const field of ['CMSId','Vendor Name','Office address','Phone','Country','Status','Category/module','Availability','CMS-only content/assets','DB-only contacts/mailing']) {
      comparison.push({field,expected:'Submitted values and returned IDs after successful Save',benefitDB:'Not read: vendor was not created',cms:'Not compared: no created CMSId',result:'Not run'});
    }
    await info.attach('Creation stages and comparison results',{body:JSON.stringify({stages,created:created?{id:value(created,'Id'),cmsId:value(created,'CMSId')}:null,comparison},null,2),contentType:'application/json'});
    const text='# BenefitDB / CMS comparison\n\n'+stages.map(s=>'- '+s.name+': '+s.status+(s.reason?' - '+s.reason:'')).join('\n')
      +'\n\n| Field | Expected | BenefitDB | CMS | Result |\n|---|---|---|---|---|\n'
      +comparison.map(r=>'| '+[r.field,r.expected,r.benefitDB,r.cms,r.result].map(v=>(typeof v==='string'?v:(JSON.stringify(v)??'Missing')).replace(/\|/g,'/').replace(/\s+/g,' ')).join(' | ')+' |').join('\n');
    await info.attach('Readable BenefitDB vs CMS comparison',{body:text,contentType:'text/markdown'});
  }
});



