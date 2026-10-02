-- WORKSHOP DEMO, UAT ONLY: put two real data inconsistencies into the RSA database.
-- The unchanged suite then fails exactly two cases: TC02.2 and TC05.3. Undo with revert-demo-bugs.sql.
--
-- Bug 1 -> TC02.2 "dealer detail opens from the list with matching code and name"
--   The list reads cloud.ClientDealer.dealerName; the detail shows the CMS vendor_name (DealerController.cs:88-111).
--   Real cause: dealer renamed in the CMS, Benefit -> RSA dealer sync failed or never ran.
--   The "0000" prefix moves the dealer to the top of the client-380 list, the row TC02.2 opens.
--
-- Bug 2 -> TC05.3 "creating a job assigns a job id"
--   The job form lists an inactive client as a disabled option, and the server refuses the save
--   when cloud.Client.status <> 701 (MswsController.cs:421).
--   Real cause: client active in Benefit, but the Benefit -> RSA client sync left it inactive in RSA.
--   While seeded, nobody can create a Honda (380) job on UAT - keep the window short.

IF DB_NAME() NOT LIKE '%Staging%' AND DB_NAME() NOT LIKE '%Uat%'
    THROW 50000, 'Refusing to run: not a UAT/staging database.', 1;

BEGIN TRAN;

-- Bug 1: dealer name drift
DECLARE @dealerId int = (
    SELECT TOP 1 dealerId FROM cloud.ClientDealer
    WHERE clientId = 380 AND bActive = 1 AND vendorCmsId IS NOT NULL AND vendorCmsId <> ''
      AND dealerName NOT LIKE '0000 DEMO-DRIFT %'
    ORDER BY dealerName);   -- first row of the client-380 list = the row TC02.2 opens
IF @dealerId IS NULL BEGIN ROLLBACK; THROW 50001, 'No CMS-linked active Honda dealer found.', 1; END

UPDATE cloud.ClientDealer SET dealerName = '0000 DEMO-DRIFT ' + dealerName WHERE dealerId = @dealerId;

-- Bug 2: client inactive in RSA
IF (SELECT status FROM cloud.Client WHERE clientId = 380) <> 701
BEGIN ROLLBACK; THROW 50002, 'Client 380 is not 701 (active) now - not touching it.', 1; END

UPDATE cloud.Client SET status = 702 WHERE clientId = 380;   -- anything but 701 = inactive for RSA

COMMIT;

SELECT 'dealer' AS what, CAST(dealerId AS varchar) AS id, dealerName AS now_value FROM cloud.ClientDealer WHERE dealerId = @dealerId
UNION ALL
SELECT 'client', CAST(clientId AS varchar), CAST(status AS varchar) FROM cloud.Client WHERE clientId = 380;
