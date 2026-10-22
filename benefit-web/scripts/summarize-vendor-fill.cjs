const fs=require('node:fs'),path=require('node:path');
const out='docs/vendor-creation',folder=out+'/evidence/full-input';
const results=JSON.parse(fs.readFileSync(folder+'/field-results.json','utf8'));
const fields=JSON.parse(fs.readFileSync(folder+'/final-fields.json','utf8'));
const uploads=results.filter(r=>/ upload$/.test(r.field));
const entered=results.filter(r=>r.result==='Done'&&r.detail?.entered);
for(const r of results){
 if(/Vendor CMS ID|Vendor ID \[/.test(r.field)){r.result='Expected read-only';r.detail='Generated only after successful creation; not an input prerequisite.';}
 if(r.field.startsWith('Rich text toolbar select')){r.result='Not a user field';r.detail='Hidden native Quill select; visible toolbar buttons exercised.';}
}
fs.writeFileSync(folder+'/field-results.json',JSON.stringify(results,null,2));
const tidy=s=>String(s).replace(/\s+/g,' ').replace(/\|/g,'/').trim();
const table='| Element / action | Result | Actual value or reason |\n|---|---|---|\n'+results.map(r=>'| '+tidy(r.field)+' | '+r.result+' | '+tidy(typeof r.detail==='object'?JSON.stringify(r.detail):r.detail)+' |').join('\n');
const summary=`## Dependency-aware field input exercise

Follow-up input run, 7 October 2026. ABF logic was read before choosing the order. ${entered.length} text/rich-text values were entered and retained after blur. In addition: English selected; Client availability selected; two distinct clients and their dependent programs chosen; three contact phone prefixes set to (+66); extra email/phone/contact/client rows exercised; visible rich-text bold formatting applied; both logo/gallery uploads finalized with HTTP 200 and one CMS asset each. These are input/upload results, not a saved-vendor or SQL consistency pass.

The required Vendor Information controls still remain disabled after selecting English. Thus primary category/subcategory cannot be selected; category-specific/RSA vehicle/dealer fields cannot be revealed. Vendor ID and Vendor CMS ID are correctly read-only generated fields, not failures. Hidden Quill helper fields/native selects are not user inputs. Save stayed disabled and was not submitted.

ABF dependency order: English + Create policy -> editable vendor information; Category -> filtered Subcategory -> category_module_mappings/vendor identity -> category-specific module fields; completed category pair -> additional category; Client availability -> Client -> available Programs; repeat contact -> country prefix -> phone number; file -> presigned URL -> S3 PUT -> CMS finalize -> preview/asset ID. Current status/country defaults remain Active/Thailand.

![Populated dependent fields and upload previews](evidence/full-input/all-fields-populated.png)

Inputs are synthetic QA values; no vendor was created. Uploading immediately creates staged storage files/CMS assets even without Save. The final asset IDs are recorded in the field table and ignored cleanup manifest. Multiple input passes were used; known earlier finalized asset IDs are also retained for reviewed cleanup. This is a change from the original read-only readiness run, which did not perform CMS writes.

Upload response contract: /api/vendors/kontenai/generic/images/uploadCMS returns message and data, not a Succeeded flag. Verified nonempty asset IDs and preview, not merely HTTP status. The earlier checker was corrected; successful finalization must not be reported as a CMS failure.

Final client selections: VIETCOMBANK -> Viecombank Visa Dining; VISA -> Visa Dining. No availability mapping was persisted because vendor Save was not performed. Six mailing values, eight contact values and six descriptive/policy values were retained. Raw trace/video/network/final-fields are in evidence/full-input; these local files are excluded from Git. Detailed results: FIELD-INPUT-REPORT.md. Repeat with npm run test:vendor:fill; that command uploads synthetic assets.

`;
fs.writeFileSync(out+'/FIELD-INPUT-REPORT.md','# Vendor form input results\n\n'+summary+'\n'+table+'\n');
let report=fs.readFileSync(out+'/REPORT.md','utf8');
if(!report.includes('## Dependency-aware field input exercise'))report=report.replace('## Outcome and evidence limits',()=>summary+'\n## Outcome and evidence limits');
report=report.replace('Only VC-001 through VC-005 have run; the remaining cases are specifications marked Not run.','VC-001 through VC-005 ran as readiness tests. The follow-up field script exercised input/upload portions of VC-019, VC-023 and VC-024; these are marked partially executed. Other full creation/failure cases remain unexecuted.');
fs.writeFileSync(out+'/REPORT.md',report);
const statuses={'VC-006':'Blocked: required Vendor Information disabled','VC-015':'Blocked: primary category/subcategory disabled','VC-019':'Partially executed: two client/program choices; no Save/SQL','VC-023':'Partially executed: mailing/repeat contacts retained; no Save/SQL','VC-024':'Partially executed: S3/CMS asset finalize passed; no vendor Save/link verification'};
const catalog=JSON.parse(fs.readFileSync(out+'/test-cases.json','utf8'));
for(const c of catalog)if(statuses[c.id])c.status=statuses[c.id];
fs.writeFileSync(out+'/test-cases.json',JSON.stringify(catalog,null,2));
let md=fs.readFileSync(out+'/TEST-CASES.md','utf8');
for(const [id,status] of Object.entries(statuses)){const start=md.indexOf('## '+id+' ');const end=md.indexOf('\n## ',start+1);const part=md.slice(start,end<0?md.length:end);md=md.slice(0,start)+part.replace(/- Execution: [^\n]*/,()=>'- Execution: '+status+'.')+md.slice(end<0?md.length:end);}
md=md.replace('Only VC-001 through VC-005 have been implemented/executed; creation/fault cases are specifications.','VC-001 through VC-005 are implemented readiness checks. Follow-up script partially exercised VC-019/023/024 inputs/uploads; saved creation and fault cases remain unexecuted.');
fs.writeFileSync(out+'/TEST-CASES.md',md);
const cleanup={note:'Synthetic assets uploaded through UAT application; vendor not saved. For owner-reviewed cleanup only.',knownEarlierAssetIds:['28d7fbe7-be1e-5cd5-83ab-e59d02589be7','d2c3d695-cb11-5c71-b3ab-29cdef595e83'],finalRunAssetIds:uploads.flatMap(r=>r.detail?.assetIds??[])};
fs.writeFileSync(folder+'/cleanup-manifest.json',JSON.stringify(cleanup,null,2));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.scripts['test:vendor:fill']='node scripts/vendor-fill-all.cjs';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));
let readme=fs.readFileSync('README.md','utf8');readme+='\n## Fill accessible vendor fields\n\nRun npm run test:vendor:fill to follow ABF dependencies and populate available fields, repeated contacts/client rows, programs and synthetic image uploads. It does not click Save. Uploads immediately create staged files/CMS assets even without saving a vendor. Field-level results, final values and trace/video/screenshots are in ignored docs/vendor-creation/evidence/full-input. See FIELD-INPUT-REPORT.md for the measured coverage and disabled controls.\n';fs.writeFileSync('README.md',readme);
console.log(JSON.stringify({retainedTextFields:entered.length,uploadResults:uploads.map(r=>({field:r.field,result:r.result,assetCount:r.detail?.assetCount})),fieldActions:results.length}));
