import { expect, type APIRequestContext } from '@playwright/test';
import mysql, { type Connection } from 'mysql2/promise';
export const value = (object: any, key: string): any => {
  const actual = Object.keys(object ?? {}).find(k => k.toLowerCase() === key.toLowerCase());
  return actual ? object[actual] : undefined;
};
export type Comparison = { field: string; expected: unknown; benefitDB: unknown; cms: unknown; result: string };
export async function connectBenefitDB() {
  if (!process.env.BENEFIT_DB_USER || !process.env.BENEFIT_DB_PASSWORD) {
    throw new Error('BLOCKED: Set BENEFIT_DB_USER and BENEFIT_DB_PASSWORD in ignored .env; open the UAT tunnel.');
  }
  try {
    const connection = await mysql.createConnection({
      host: process.env.BENEFIT_DB_HOST ?? '127.0.0.1',
      port: Number(process.env.BENEFIT_DB_PORT ?? 3375),
      user: process.env.BENEFIT_DB_USER, password: process.env.BENEFIT_DB_PASSWORD,
      database: process.env.BENEFIT_DB_DATABASE ?? 'AspireProdBackup', connectTimeout: 10_000,
    });
    const [rows] = await connection.execute<any[]>('SELECT DATABASE() AS name');
    if (rows[0].name !== 'AspireProdBackup') { await connection.end(); throw new Error('Wrong database'); }
    return connection;
  } catch (error: any) {
    throw new Error(`BLOCKED: Benefit UAT database read connection unavailable (${error.code ?? 'configuration'}).`);
  }
}
export async function compareVendor(connection: Connection, request: APIRequestContext,
  id: number, cmsId: string, payload: any, countries: any[], rows: Comparison[]) {
  const vendorRequest = value(payload, 'VendorRequest');
  const template = value(payload, 'TemplateGeneric');
  const [vendors] = await connection.execute<any[]>(
    'SELECT Id,CMSId,FullNameEN,Address,AddressEN,MobilePhone,CountryId,Status,KeyContactEN FROM vendors WHERE CMSId=? AND Deleted IS NULL', [cmsId]);
  const env = process.env.BENEFIT_CMS_ENVIRONMENT_ID ?? '225b0999-fce9-02b4-c44b-ed6990faeeaa';
  if (env !== '225b0999-fce9-02b4-c44b-ed6990faeeaa') throw new Error('BLOCKED: This test only reads the configured SIT/UAT CMS environment.');
  let document: any;
  await expect.poll(async () => {
    const response = await request.get(`https://deliver.kontent.ai/${env}/items`, {
      params: {'system.id': cmsId, language: 'en', depth: '2'},
      headers: {'X-KC-Wait-For-Loading-New-Content':'true'},
    });
    if (!response.ok()) return false;
    document = await response.json();
    return document.items?.length === 1;
  }, {timeout:60_000,message:'Created CMS vendor must become available in published English content'}).toBe(true);
  const cms = document.items[0];
  function check(field: string, expected: unknown, db: unknown, content: unknown, dbApplicable=true) {
    const same = JSON.stringify(dbApplicable ? db : expected) === JSON.stringify(expected)
      && JSON.stringify(content) === JSON.stringify(expected);
    rows.push({field,expected,benefitDB:dbApplicable ? db : 'Not mirrored by v2 creation',cms:content,result:same?'Passed':'Failed'});
  }
  check('Exactly one vendor',1,vendors.length,document.items.length);
  if (vendors.length !== 1) throw new Error('BenefitDB must contain exactly one nondeleted vendor for returned CMSId.');
  const db=vendors[0], elements=cms.elements;
  const element=(key:string)=>elements[key]?.value;
  check('CMSId',cmsId.toLowerCase(),String(db.CMSId).toLowerCase(),cms.system.id.toLowerCase());
  rows.push({field:'Benefit Id',expected:id,benefitDB:db.Id,cms:'Independent CMS GUID',result:db.Id===id?'Passed':'Failed'});
  check('Vendor Name',String(value(vendorRequest,'VendorName')).trim(),db.FullNameEN,element('vendor_name'));
  check('Office address',value(vendorRequest,'OfficeAddress')??'',db.AddressEN??'',element('office_address')??'');
  check('Phone number',value(vendorRequest,'PhoneNumber')??'',db.MobilePhone??'',element('phone_number')??'');
  check('Active status','active',Number(db.Status)===701?'active':String(db.Status),element('vendor_status')?.[0]?.codename);
  const country=countries.find(c=>Number(value(c,'Id'))===Number(db.CountryId));
  const linkedCountry=document.modular_content?.[element('vendor_country')?.[0]];
  check('Country code',String(value(country,'CountryCodeAlpha2')??'').toUpperCase(),String(value(country,'CountryCodeAlpha2')??'').toUpperCase(),String(linkedCountry?.elements?.country_code?.value??'').toUpperCase());
  if(!country) rows.push({field:'Country lookup',expected:'Resolved market country',benefitDB:db.CountryId,cms:'Unresolved',result:'Failed'});
  const [categories]=await connection.execute<any[]>('SELECT CategoryId,SubCategoryId,CmsModuleCodename FROM vendor_category_mappings WHERE VendorId=?',[id]);
  const expectedCategories=(value(vendorRequest,'VendorCategoryMappings')??[]).map((m:any)=>({category:Number(value(m,'CategoryId')),subcategory:Number(value(m,'SubCategoryId')),module:value(m,'CmsModuleCodename')}));
  const actualCategories=categories.map(m=>({category:Number(m.CategoryId),subcategory:Number(m.SubCategoryId),module:m.CmsModuleCodename}));
  const cmsModules=(element('module_dynamic_category')??[]).map((code:string)=>document.modular_content?.[code]?.system.type).sort();
  const canonical=(list:any[])=>[...list].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  check('Category mappings and module types',canonical(expectedCategories),canonical(actualCategories),canonical(expectedCategories.map((m:any)=>({...m,module:cmsModules.includes(m.module)?m.module:'Missing CMS module type'}))));
  const [mappings]=await connection.execute<any[]>('SELECT ClientId,ProgramId FROM vendor_client_program_mappings WHERE VendorId=?',[id]);
  const expectedMappings=(value(vendorRequest,'VendorClientProgramsRequests')??[]).filter((m:any)=>value(m,'ClientId')!=null)
    .flatMap((m:any)=>{const programs=value(m,'ProgramIds')??[];return(programs.length?programs:[null]).map((p:any)=>({client:Number(value(m,'ClientId')),program:p==null?null:Number(p)}));});
  rows.push({field:'Client/program DB mappings',expected:canonical(expectedMappings),benefitDB:canonical(mappings.map(m=>({client:Number(m.ClientId),program:m.ProgramId==null?null:Number(m.ProgramId)}))),cms:element('client_availability_config'),result:JSON.stringify(canonical(expectedMappings))===JSON.stringify(canonical(mappings.map(m=>({client:Number(m.ClientId),program:m.ProgramId==null?null:Number(m.ProgramId)}))))?'Passed':'Failed'});
  check('Availability choice',value(value(template,'Availability')?.[0],'Codename'),null,element('availability')?.[0]?.codename,false);
  check('Client availability text',value(template,'ClientAvailabilityConfig')??'',null,element('client_availability_config')??'',false);
  for(const [property,codename]of [['Email','email'],['Website','website'],['Description','description'],['ShortDescription','short_description'],['InsiderTips','insider_tips'],['TermsAndCondition','terms_and_condition'],['CancellationPolicy','cancellation_policy'],['FulfillmentInstruction','fulfillment_instruction'],['CategoryText','category_text'],['SubCategoryText','sub_category_text']]) {
    check(property,value(template,property)??'',null,element(codename)??'',false);
  }
  const key=process.env.BENEFIT_CMS_MANAGEMENT_KEY;
  if(!key)throw new Error('BLOCKED: CMS management read key required to compare exact asset IDs.');
  const management=async(path:string)=>{const response=await fetch(`https://manage.kontent.ai/v2/projects/${env}/${path}`,{headers:{Authorization:`Bearer ${key}`}});if(!response.ok)throw new Error(`CMS management read failed (${response.status}).`);return response.json() as Promise<any>;};
  const variant=await management(`items/${cmsId}/variants/codename/en`);
  const type=await management('types/codename/template_generic');
  for(const [property,codename]of [['Logo','logo'],['Image','image']]) {
    const expected=(value(template,property)??[]).map((a:any)=>String(value(a,'Id')).toLowerCase()).sort();
    const elementId=type.elements.find((e:any)=>e.codename===codename)?.id;
    const actual=(variant.elements.find((e:any)=>e.element.id===elementId)?.value??[]).map((a:any)=>String(a.id).toLowerCase()).sort();
    const matches=JSON.stringify(actual)===JSON.stringify(expected)&&(element(codename)??[]).length===expected.length;
    rows.push({field:property+' asset links',expected,benefitDB:'Not mirrored by v2 creation',cms:{assetIds:actual,publishedAssets:element(codename)},result:matches?'Passed':'Failed'});
  }
  const contacts=value(vendorRequest,'KeyContactEN')??'{}';
  rows.push({field:'Key contact JSON',expected:JSON.parse(contacts),benefitDB:JSON.parse(db.KeyContactEN??'{}'),cms:'No TemplateGeneric contact mirror',result:JSON.stringify(JSON.parse(contacts))===JSON.stringify(JSON.parse(db.KeyContactEN??'{}'))?'Passed':'Failed'});
  const [mailing]=await connection.execute<any[]>('SELECT MailingRecipientName,MailingAddress,MailingDistrict,MailingSubDistrict,MailingProvince,MailingZipCode FROM vendor_mailing_details WHERE VendorId=?',[id]);
  const keys=['MailingRecipientName','MailingAddress','MailingDistrict','MailingSubDistrict','MailingProvince','MailingZipCode'];
  const normalized=(items:any[])=>canonical(items.map(m=>Object.fromEntries(keys.map(k=>[k,value(m,k)??'']))));
  const expectedMail=normalized(value(vendorRequest,'VendorMailingDetailRequests')??[]),actualMail=normalized(mailing);
  rows.push({field:'Mailing details',expected:expectedMail,benefitDB:actualMail,cms:'No TemplateGeneric mailing mirror',result:JSON.stringify(expectedMail)===JSON.stringify(actualMail)?'Passed':'Failed'});
  expect(rows.filter(r=>r.result==='Failed'),'BenefitDB/CMS mismatches').toEqual([]);
}


