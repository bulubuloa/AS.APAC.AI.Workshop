-- SELECT-only comparison for one successfully created synthetic vendor.
-- Verify UAT schema/columns first, then replace <CMS_ID> with response Data.CMSId.
SELECT DATABASE() AS connected_schema;
SELECT Id,CMSId,FullNameEN,Address,AddressEN,MobilePhone,CountryId,Status,KeyContactEN
FROM vendors WHERE CMSId='<CMS_ID>' AND Deleted IS NULL;
SELECT COUNT(*) AS vendor_count FROM vendors WHERE CMSId='<CMS_ID>' AND Deleted IS NULL;
SELECT m.CategoryId,m.SubCategoryId,m.CmsModuleCodename,c.MasterCode AS category_code,
s.MasterCode AS subcategory_code,c.MasterNameEN AS category_name,s.MasterNameEN AS subcategory_name
FROM vendor_category_mappings m JOIN vendors v ON v.Id=m.VendorId
JOIN masterdatas c ON c.Id=m.CategoryId JOIN masterdatas s ON s.Id=m.SubCategoryId
WHERE v.CMSId='<CMS_ID>';
SELECT m.ClientId,m.ProgramId,COUNT(*) AS mapping_count
FROM vendor_client_program_mappings m JOIN vendors v ON v.Id=m.VendorId
WHERE v.CMSId='<CMS_ID>' GROUP BY m.ClientId,m.ProgramId;
SELECT m.MailingRecipientName,m.MailingAddress,m.MailingDistrict,m.MailingSubDistrict,m.MailingProvince,m.MailingZipCode
FROM vendor_mailing_details m JOIN vendors v ON v.Id=m.VendorId WHERE v.CMSId='<CMS_ID>';
