const {expect}=require('@playwright/test');
const fs=require('node:fs');
function sample(label,index){
 const key=label.toLowerCase();
 if(/email/.test(key))return `qa.contact${index}@example.invalid`;
 if(/zip|postal/.test(key))return '10110';
 if(/phone|mobile|fax|number/.test(key))return '812345678';
 if(/website|url/.test(key))return 'https://example.com';
 if(/district/.test(key))return 'QA Test District';
 if(/province/.test(key))return 'Bangkok';
 if(/address/.test(key))return '123 QA Test Street, Bangkok';
 if(/terms/.test(key))return 'Synthetic UAT test terms. No real contract.';
 if(/cancel/.test(key))return 'Synthetic UAT test cancellation policy.';
 if(/fulfil/.test(key))return 'Synthetic UAT test instructions: confirm with QA.';
 if(/insider/.test(key))return 'Synthetic QA insider tips.';
 if(/description/.test(key))return 'Synthetic vendor profile used only for UAT field testing.';
 if(/vendor name/.test(key))return 'QA_VENDOR_FIELD_FILL_'+Date.now();
 if(/name/.test(key))return 'QA Contact '+index;
 return 'QA Test Value '+index;
}

module.exports.fillVendor=async function(page,{folder,includeSecondClient=false}){
 const context=page.context();
 const results=[],network=[];fs.mkdirSync(folder,{recursive:true});
 async function action(field,fn){try{const detail=await fn();results.push({field,result:'Done',detail});}catch(e){results.push({field,result:'Blocked',detail:e.message.split('\n')[0]});}fs.writeFileSync(folder+'/field-results.json',JSON.stringify(results,null,2));}
 let clientWithPrograms=null;
 page.on('response', async r=>{if(new URL(r.url()).pathname.endsWith('/v2/get-by-cmsid/0')){try{const b=await r.json();const data=b.data??b.Data;const clients=data?.vendorClientOptions??data?.VendorClientOptions??[];clientWithPrograms=clients.find(c=>(c.programs??c.Programs??[]).length>0); }catch{}}});
 page.on('response',r=>{const u=new URL(r.url());if(/\/api\/|amazonaws.com|kontent.ai/.test(u.href))network.push({method:r.request().method(),host:u.host,path:u.pathname,status:r.status()});});
 page.on('pageerror',e=>results.push({field:'Browser runtime',result:'Error',detail:e.message.slice(0,400)}));
 await page.goto(new URL('/dashboard',process.env.BENEFIT_BASE_URL).href);
 const countryFilter=page.locator('header .mud-select').first();
 await expect(countryFilter).toBeVisible({timeout:60000});
 await countryFilter.click();
 const thailand=page.locator('.mud-popover-open .mud-list-item').filter({hasText:/^\s*Thailand\s*$/});
 await expect(thailand).toBeVisible({timeout:15000});
 await thailand.click();
 await expect(page.locator('header')).toContainText('Thailand',{timeout:30000});
 await expect(countryFilter.locator('input').first()).toBeEnabled({timeout:30000});
 results.push({field:'Global country prerequisite',result:'Done',detail:'Selected Thailand in top-right country filter before opening creation'});
 await page.goto(new URL('/vendors-ver2/add',process.env.BENEFIT_BASE_URL).href);
 await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible({timeout:60000});
 async function select(box,label,preferred){
  const input=box.locator('input').first();
  if(await input.count()&&await input.isDisabled())throw Error('Disabled by application');
  await box.click({timeout:5000});
  const choices=page.locator('.mud-popover-open .mud-list-item:not(.mud-list-item-disabled)');
  await expect(choices.first()).toBeVisible({timeout:5000});
  const texts=await choices.allTextContents();
  let idx=preferred?texts.findIndex(t=>(typeof preferred==='string'?t.trim()===preferred:preferred.test(t.trim()))):-1;
  if(idx<0)idx=texts.findIndex(t=>t.trim()&&!/please select|select all/i.test(t));
  if(idx<0){await page.keyboard.press('Escape');throw Error('No available options');}
  const value=texts[idx].trim();await choices.nth(idx).click({timeout:5000});await page.keyboard.press('Escape');return value;
 }
 await action('Language prerequisite',()=>select(page.locator('.select-language__dropdown'),'Language',/^English$/));
 await page.reload();
 await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible({timeout:60000});
 await expect(page.locator('header')).toContainText('Thailand',{timeout:30000});
 await expect(page.locator('.select-language__dropdown')).toContainText('English',{timeout:30000});
 results.push({field:'Language initialization',result:'Done',detail:'Reloaded creation after selecting English so editability is initialized from the retained locale'});
 async function group(label){return page.locator('#vendor_information .form-group').filter({has:page.locator('label').filter({hasText:new RegExp('^\\s*'+label+'\\s*\\*?\\s*$')})}).first();}
 for(const [label,preferred]of[['Country',/^Thailand$/],['Vendor Status',/^Active$/],['Vendor Group',null],['Primary Category',/FOOD|DINING|TRAVEL/i],['Primary Sub-Category',/RESTAURANT/i]]){
  await action(label,async()=>{const box=await group(label);return select(box.locator('.mud-select').first(),label,preferred);});
 }
 for(const name of ['Add email','Add phone number','Add additional contact'])await action(name,async()=>{const btn=page.getByRole('button',{name,exact:true}).first();if(await btn.isDisabled())throw Error('Disabled by application');await btn.click({timeout:5000});return 'Added repeatable contact control';});
 await action('Client availability prerequisite',async()=>{await page.locator('#availability').getByText('Client',{exact:true}).first().click({timeout:5000});return 'Selected Client; client/program fields can now appear';});
 const prefixes=page.locator('#key_contact .phone-code-select');
 for(let p=0;p<await prefixes.count();p++)await action('Phone country-code prerequisite '+(p+1),()=>select(prefixes.nth(p),'Phone prefix',/66/));
 if(results.some(r=>r.field==='Primary Sub-Category'&&r.result==='Done')) {
  await action('Category-specific fields loaded',async()=>{await expect(page.locator('#category_specific_fields')).toBeVisible({timeout:20000});return 'Mapped module visible';});
  const selects=page.locator('#category_specific_fields .mud-select');
  for(let i=0;i<await selects.count();i++)await action('Category-specific selection '+(i+1),()=>select(selects.nth(i),'Module field',null));
 }
 const controls=page.locator('main.content input:not([type=hidden]):not([type=file]):not([type=radio]):not([type=checkbox]), main.content textarea, main.content [contenteditable=true]');
 const inputs=await controls.elementHandles();
 for(let i=0;i<inputs.length;i++){
  const input=inputs[i];
  if(!await input.isVisible())continue;
  const info=await input.evaluate(e=>({label:e.closest('.form-group')?.querySelector('label')?.textContent?.trim()||e.closest('section')?.querySelector('h3')?.textContent?.trim()||'Unnamed field',section:e.closest('section')?.id,tag:e.tagName,type:e.type,readonly:e.readOnly,disabled:e.disabled,value:e.value||e.textContent,dropdown:!!e.closest('.mud-select')}));
  const label=`${info.section||'form'} / ${info.label} [${i+1}]`;
  if(info.dropdown){results.push({field:label,result:'Selection control',detail:info.disabled?'Disabled':info.value||'Dependent selection'});continue;}
  if(!await input.isVisible()){results.push({field:label,result:'Not a user field',detail:'Hidden editor implementation control'});continue;}
  await action(label,async()=>{if(info.disabled)throw Error('Disabled by application');if(info.readonly)throw Error('Read-only/generated value');const value=info.type==='number'?'1':info.type==='date'?'2026-10-07':sample(info.label,i+1);await input.fill(value,{timeout:5000});await input.evaluate(e=>e.blur());const retained=await input.evaluate(e=>e.value??e.textContent);if(!retained)throw Error('Value cleared after blur; prerequisite or validation still unmet');return {entered:value,retained};});
 }
 const clientSelect=page.locator('#availability tbody tr').first().locator('td').nth(0).locator('.mud-select').first();
 if(await clientSelect.count())await action('Client selection after availability',()=>select(clientSelect,'Client',clientWithPrograms?(clientWithPrograms.clientName??clientWithPrograms.ClientName):null));
 const programBox=page.locator('#availability tbody tr').first().locator('td').nth(1);
 if(await programBox.count())await action('Program selection after client',async()=>{
  const clickable=programBox.locator('.select-box').first();
  if(!await clickable.count())throw Error('Program selector unavailable');
  await clickable.click({timeout:5000});
  const options=programBox.locator('.option-item:not(.option-item--disabled)');
  await expect(options.first()).toBeVisible({timeout:5000});
  const value=(await options.first().innerText()).trim();
  await options.first().click({timeout:5000});await clickable.click({timeout:5000});return value;
 });
 if(includeSecondClient){
 await action('Add Client repeatable row',async()=>{await page.locator('#availability').getByRole('button',{name:'Add Client',exact:true}).click({timeout:5000});return 'Added second client row';});
 const secondRow=page.locator('#availability tbody tr').nth(1);
 if(await secondRow.count()){
  await action('Second client selection',()=>select(secondRow.locator('td').nth(0).locator('.mud-select').first(),'Second Client',null));
  await action('Second client program dependency',async()=>{
   const box=secondRow.locator('td').nth(1).locator('.select-box');await box.click({timeout:5000});
   const options=secondRow.locator('.option-item:not(.option-item--disabled)');
   if(!await options.count()){await box.click({timeout:5000});return 'No selectable programs for this client; client-wide availability retained';}
   const name=(await options.first().innerText()).trim();await options.first().click({timeout:5000});await box.click({timeout:5000});return name;
  });
 }
 }
 const nativeSelect=page.locator('main.content select');
 for(let i=0;i<await nativeSelect.count();i++)await action('Rich text toolbar select '+i,async()=>{const el=nativeSelect.nth(i);if(!await el.isVisible())return 'Hidden toolbar implementation select; visible picker used instead';const options=await el.locator('option').evaluateAll(els=>els.map(e=>({value:e.value,disabled:e.disabled})));const valid=options.find(o=>!o.disabled&&o.value)||options[0];if(!valid)throw Error('No options');await el.selectOption(valid.value,{timeout:5000});return valid.value||'Default';});
 for(const section of ['description','terms_and_conditions'])await action(section+' visible rich-text formatting',async()=>{const editor=page.locator('#'+section+' .ql-editor');await editor.click({timeout:5000});await page.keyboard.press('Control+A');await page.locator('#'+section+' button.ql-bold').click({timeout:5000});return 'Applied bold using visible toolbar';});
 const canEnterRequired=await page.locator('#vendor_information .form-group').filter({has:page.locator('label').filter({hasText:/^\s*Vendor Name\s*\*?\s*$/})}).locator('input').first().isEnabled();
 if(canEnterRequired){
 const fixture=await context.newPage();await fixture.setContent('<div style="width:320px;height:160px;background:#15354a;color:white;font:24px sans-serif;display:flex;align-items:center;justify-content:center">QA Vendor Test Image</div>');await fixture.locator('div').screenshot({path:folder+'/qa-vendor.png'});await fixture.close();
 for(const section of ['logo','gallery'])await action(section+' upload',async()=>{const file=page.locator('#'+section+' input[type=file]');if(await file.isDisabled())throw Error('File upload disabled');const responseWait=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname.endsWith('/generic/images/uploadCMS'),{timeout:65000});await file.setInputFiles(folder+'/qa-vendor.png',{timeout:10000});const response=await responseWait;const body=await response.json();const assets=body.data??body.Data;if(!response.ok()||!Array.isArray(assets)||!assets.length)throw Error('CMS asset finalize returned no assets');return {upload:'Finalized synthetic QA PNG',status:response.status(),assetCount:assets.length,assetIds:assets.map(a=>a.id??a.Id),message:body.message};});
 }else{results.push({field:'Logo/gallery',result:'Not run',detail:'Creation prerequisites blocked; prior successful upload evidence attached separately'});}
 await page.getByRole('button',{name:'Save',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:folder+'/all-fields-populated.png',fullPage:true,mask:[page.locator('header'),page.locator('aside')]});
 const finalFields=await page.locator('main.content input,main.content textarea,main.content .ql-editor').evaluateAll(els=>els.filter(e=>e.offsetWidth&&e.offsetHeight).map(e=>({label:e.closest('.form-group')?.querySelector('label')?.textContent?.trim()||e.closest('section')?.querySelector('h3')?.textContent?.trim(),section:e.closest('section')?.id,value:e.value??e.textContent,disabled:e.disabled})));
 fs.writeFileSync(folder+'/final-fields.json',JSON.stringify(finalFields,null,2));
 results.push({field:'Save',result:await page.getByRole('button',{name:'Save',exact:true}).isDisabled()?'Disabled':'Available',detail:'Not submitted: this run exercises input controls only'});
 fs.writeFileSync(folder+'/field-results.json',JSON.stringify(results,null,2));
 fs.writeFileSync(folder+'/network.json',JSON.stringify(network,null,2));

 return {results,network,finalFields};
};





