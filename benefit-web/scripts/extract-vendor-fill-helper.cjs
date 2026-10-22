const fs=require('node:fs');
const source=fs.readFileSync('scripts/vendor-fill-all.cjs','utf8');
const sample=source.slice(source.indexOf('function sample('),source.indexOf('(async()=>'));
let body=source.slice(source.indexOf(' let clientWithPrograms'),source.indexOf(' await context.tracing.stop'));
body=body.replace("const value=sample(info.label,i+1);", "const value=info.type==='number'?'1':info.type==='date'?'2026-10-07':sample(info.label,i+1);");
body=body.replace("async function group(label)","async function group(label)");
body=body.replace("const controls=page.locator",()=>`if(results.some(r=>r.field==='Primary Sub-Category'&&r.result==='Done')) {
  await action('Category-specific fields loaded',async()=>{await expect(page.locator('#category_specific_fields')).toBeVisible({timeout:20000});return 'Mapped module visible';});
  const selects=page.locator('#category_specific_fields .mud-select');
  for(let i=0;i<await selects.count();i++)await action('Category-specific selection '+(i+1),()=>select(selects.nth(i),'Module field',null));
 }
 const controls=page.locator`);
const secondStart=body.indexOf(" await action('Add Client repeatable row'");
const secondEnd=body.indexOf(' const nativeSelect',secondStart);
body=body.slice(0,secondStart)+' if(includeSecondClient){\n'+body.slice(secondStart,secondEnd)+' }\n'+body.slice(secondEnd);
const uploadStart=body.indexOf(' const fixture=await context.newPage()');
const uploadEnd=body.indexOf(" await page.getByRole('button',{name:'Save'",uploadStart);
body=body.slice(0,uploadStart)+` const canEnterRequired=await page.locator('#vendor_information .form-group').filter({has:page.locator('label').filter({hasText:/^\\s*Vendor Name\\s*\\*?\\s*$/})}).locator('input').first().isEnabled();
 if(canEnterRequired){
`+body.slice(uploadStart,uploadEnd)+` }else{results.push({field:'Logo/gallery',result:'Not run',detail:'Creation prerequisites blocked; prior successful upload evidence attached separately'});}
`+body.slice(uploadEnd);
const helper=`const {expect}=require('@playwright/test');
const fs=require('node:fs');
${sample}
module.exports.fillVendor=async function(page,{folder,includeSecondClient=false}){
 const context=page.context();
 const results=[],network=[];fs.mkdirSync(folder,{recursive:true});
 async function action(field,fn){try{const detail=await fn();results.push({field,result:'Done',detail});}catch(e){results.push({field,result:'Blocked',detail:e.message.split('\\n')[0]});}}
${body}
 return {results,network,finalFields};
};
`;
fs.writeFileSync('helpers/fill-vendor.cjs',helper);
