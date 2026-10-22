-- SELECT-only UAT template, not executed; connect to BKKRsaStaging.
-- Replace <CMS_ID> only after verifying live schema.
SELECT DB_NAME() AS connected_database;
SELECT TABLE_SCHEMA,TABLE_NAME,COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='cloud' AND TABLE_NAME IN ('UserAccount','ClientDealer','Client','Vehicle','VehService') ORDER BY TABLE_NAME,ORDINAL_POSITION;
SELECT COUNT(*) AS provider_count,MIN(accountId) AS account_id,SUM(CASE WHEN active=1 THEN 1 ELSE 0 END) AS active_count,SUM(CASE WHEN isProviderMobile=1 THEN 1 ELSE 0 END) AS mobile_count FROM cloud.UserAccount WHERE vendorCmsId='<CMS_ID>';
SELECT COUNT(*) AS dealer_count,MIN(dealerId) AS dealer_id,MIN(clientId) AS client_id,SUM(CASE WHEN bActive=1 THEN 1 ELSE 0 END) AS active_count FROM cloud.ClientDealer WHERE vendorCmsId='<CMS_ID>';
SELECT d.dealerId,c.clientCode,d.bActive FROM cloud.ClientDealer d LEFT JOIN cloud.Client c ON c.clientId=d.clientId WHERE d.vendorCmsId='<CMS_ID>';
SELECT COUNT(*) AS vehicle_count,COUNT(DISTINCT v.vehicleCmsId) AS distinct_vehicle_cms_count FROM cloud.Vehicle v JOIN cloud.UserAccount u ON u.accountId=v.accountId WHERE u.vendorCmsId='<CMS_ID>';
SELECT clientCode,COUNT(*) AS client_count FROM cloud.Client WHERE clientCode IN ('HOT','MBZ','PTH') GROUP BY clientCode;
