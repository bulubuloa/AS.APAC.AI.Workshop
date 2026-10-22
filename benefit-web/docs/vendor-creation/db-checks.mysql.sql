-- SELECT-only UAT template, not executed; connect to AspireProdBackup.
-- Replace <CMS_ID> only after verifying live schema.
SELECT DATABASE() AS connected_schema;
SELECT table_name,column_name,data_type,character_maximum_length FROM information_schema.columns
WHERE table_schema=DATABASE() AND table_name IN ('vendors','vendor_category_mappings','vendor_client_program_mappings','vendor_mailing_details','vendorproductcitys','category_module_mappings','clientprograms') ORDER BY table_name,ordinal_position;
SELECT COUNT(*) AS vendor_count,MIN(Id) AS vendor_id,MIN(CountryId) AS market_id,MIN(Status) AS status_code,
MIN(CloudAccIdExternal) AS rsa_account_id,MIN(VendorIdExternal) AS rsa_dealer_id FROM vendors WHERE CMSId='<CMS_ID>' AND Deleted IS NULL;
SELECT m.CategoryId,m.SubCategoryId,m.CmsModuleCodename,COUNT(*) AS mapping_count FROM vendor_category_mappings m JOIN vendors v ON v.Id=m.VendorId WHERE v.CMSId='<CMS_ID>' GROUP BY m.CategoryId,m.SubCategoryId,m.CmsModuleCodename;
SELECT m.ClientId,m.ProgramId,COUNT(*) AS mapping_count FROM vendor_client_program_mappings m JOIN vendors v ON v.Id=m.VendorId WHERE v.CMSId='<CMS_ID>' GROUP BY m.ClientId,m.ProgramId;
SELECT COUNT(*) AS mailing_count FROM vendor_mailing_details m JOIN vendors v ON v.Id=m.VendorId WHERE v.CMSId='<CMS_ID>';
SELECT m.CmsItemCodename,COUNT(*) AS location_count FROM vendorproductcitys m JOIN vendors v ON v.Id=m.VendorId WHERE v.CMSId='<CMS_ID>' GROUP BY m.CmsItemCodename;
SELECT COUNT(*) AS invalid_program_pairs FROM vendor_client_program_mappings m JOIN vendors v ON v.Id=m.VendorId LEFT JOIN clientprograms cp ON cp.ClientId=m.ClientId AND cp.ProgramId=m.ProgramId WHERE v.CMSId='<CMS_ID>' AND m.ProgramId IS NOT NULL AND cp.ProgramId IS NULL;
SELECT c.MasterCode AS category_code,s.MasterCode AS subcategory_code,m.CmsModuleCodename FROM category_module_mappings m JOIN masterdatas c ON c.Id=m.CategoryId JOIN masterdatas s ON s.Id=m.SubCategoryId ORDER BY c.MasterCode,s.MasterCode;
