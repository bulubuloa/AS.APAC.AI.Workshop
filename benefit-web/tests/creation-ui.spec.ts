import {test,expect,type Locator} from '@playwright/test';
import {value} from '../helpers/compare-vendor';
const {fillVendor}=require('../helpers/fill-vendor.cjs');
test('TC-VENDOR-CREATE-002 save success, detail visibility and rendering vs CMS',async({page,request,baseURL},info)=>{
 test.setTimeout(240000);
 const comparisons:any[]=[];let created:any;
 const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
 try{
  expect(new URL(baseURL!).hostname).toBe('benefit-uat.aspireasia.net');
  await test.step('Fill required and accessible synthetic vendor values',async()=>{
   const input=await fillVendor(page,{folder:info.outputPath('input-evidence')});
   await info.attach('Input coverage',{body:JSON.stringify(input.results,null,2),contentType:'application/json'});
   await info.attach('Form before Save',{path:info.outputPath('input-evidence/all-fields-populated.png'),contentType:'image/png'});
   await expect(page.getByRole('button',{name:'Save',exact:true})).toBeEnabled();
  });
  await test.step('Save succeeds and the success message is shown',async()=>{
   const pending=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/vendors/v2',{timeout:60000});
   await page.getByRole('button',{name:'Save',exact:true}).click();
   const response=await pending,body=await response.json();
   expect(response.ok()).toBe(true);expect(value(body,'Succeeded')).toBe(true);
   created=value(body,'Data');expect(value(created,'CMSId')).toMatch(/^[0-9a-f-]{36}$/i);
   await info.attach('Created vendor IDs',{body:JSON.stringify(created,null,2),contentType:'application/json'});
   await expect(page.getByText('Vendor successfully created',{exact:true})).toBeVisible();
   await info.attach('Creation success message',{body:await page.screenshot(),contentType:'image/png'});
  });
  const cmsId=String(value(created,'CMSId'));let document:any;
  await test.step('Created vendor detail page is displayed',async()=>{
   await expect(page).toHaveURL(new RegExp('/vendors-ver2/'+cmsId+'(?:[?#].*)?$','i'));
   await expect(page.locator('.common-info--vendor-name')).toBeVisible();
   await expect(page.locator('.common-info--vendor-name')).not.toBeEmpty();
   await expect(page.getByText('Vendor Information',{exact:true})).toBeVisible();
   await info.attach('Vendor detail after Save',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
  await test.step('Load the same published English CMS vendor',async()=>{
   await expect.poll(async()=>{
    const response=await request.get('https://deliver.kontent.ai/225b0999-fce9-02b4-c44b-ed6990faeeaa/items',{params:{'system.id':cmsId,language:'en',depth:'2'},headers:{'X-KC-Wait-For-Loading-New-Content':'true'}});
    if(!response.ok())return false;document=await response.json();return document.items?.length===1;
   },{timeout:60000}).toBe(true);
  });
  const item=document.items[0],element=(key:string)=>item.elements[key]?.value;
  async function check(field:string,target:Locator,expected:string){
   await expect.soft(target,field+' must render the CMS value').toHaveText(normalize(expected));
   const actual=normalize(await target.innerText());comparisons.push({field,cms:normalize(expected),rendered:actual,result:actual===normalize(expected)?'Passed':'Failed'});
  }
  const field=(label:string)=>page.locator('.grid-main-session .main-session-item').filter({has:page.locator('p.thinner').filter({hasText:new RegExp('^'+label+'$')})}).first().locator('.bolder');
  const linkedName=(key:string)=>document.modular_content?.[element(key)?.[0]]?.system?.name??'-';
  await test.step('Compare visible vendor information with CMS',async()=>{
   await check('Vendor Name',page.locator('.common-info--vendor-name'),element('vendor_name'));
   await check('CMS ID',field('Vendor CMS ID'),item.system.id);
   for(const [label,key]of [['Email','email'],['Office Address','office_address'],['Website','website'],['Category','category_text'],['Sub-Category','sub_category_text']])await check(label,field(label),element(key)||'-');
   await check('Phone',field('Phone'),element('phone_number')&&element('phone_code')?element('phone_code')+' '+element('phone_number'):'-');
   await check('Vendor Status',field('Vendor Status'),element('vendor_status')?.[0]?.name??'-');
   await check('Vendor Group',field('Vendor Group'),linkedName('vendor_group'));
   await check('Country',field('Country'),linkedName('vendor_country'));
   await expect(page.getByText(String(value(created,'Id')),{exact:true}).first()).toBeVisible();
  });
  await test.step('Compare rendered content sections and images with CMS',async()=>{
   for(const [label,key]of [['Description','description'],['Short Description','short_description'],['Insider Tips','insider_tips'],['Terms and Conditions','terms_and_condition'],['Cancellation Policy','cancellation_policy'],['Fulfilment Instructions','fulfillment_instruction']]){
    const content=element(key)??'';
    const text=await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').body.textContent??'',content);
    const tab=page.locator('.tab').filter({has:page.locator('.tab-header p').filter({hasText:new RegExp('^'+label+'$')})}).first();
    if(label==='Description'||label==='Terms and Conditions'){
     if(text.trim())await check(label,tab.locator('.vendor-detail-rich-text'),text);
     else{comparisons.push({field:label,cms:'Empty',rendered:normalize(await tab.locator('.main-session-item').innerText()),result:'Passed'});}
    }else await check(label,tab.locator('.main-session-item .bolder').first(),text||'-');
   }
   for(const [label,key]of [['Logo','logo'],['Gallery','image']]){
    const tab=page.locator('.tab').filter({has:page.locator('.tab-header p').filter({hasText:new RegExp('^'+label+'$')})}).first();
    const expected=(element(key)??[]).map((a:any)=>new URL(a.url).href).sort();
    await expect.soft(tab.locator('img'),label+' image count').toHaveCount(expected.length);
    const actual=await tab.locator('img').evaluateAll(images=>images.map(img=>(img as HTMLImageElement).src).sort());
    const loaded=await tab.locator('img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0));
    expect.soft(actual,label+' image sources').toEqual(expected);expect.soft(loaded,label+' images loaded').toBe(true);
    comparisons.push({field:label,cms:expected,rendered:actual,result:JSON.stringify(expected)===JSON.stringify(actual)&&loaded?'Passed':'Failed'});
   }
   await info.attach('Compared vendor detail',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
 }finally{
  await info.attach('Detail rendering vs CMS',{body:JSON.stringify({created,comparisons},null,2),contentType:'application/json'});
  await info.attach('Readable rendering comparison',{body:'| Field | CMS | Rendered | Result |\n|---|---|---|---|\n'+comparisons.map(r=>'| '+[r.field,r.cms,r.rendered,r.result].map(v=>String(typeof v==='string'?v:JSON.stringify(v)).replace(/\|/g,'/').replace(/\s+/g,' ')).join(' | ')+' |').join('\n'),contentType:'text/markdown'});
 }
});
