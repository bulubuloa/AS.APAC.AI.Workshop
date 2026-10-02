-- Undo seed-demo-bugs.sql.
IF DB_NAME() NOT LIKE '%Staging%' AND DB_NAME() NOT LIKE '%Uat%'
    THROW 50000, 'Refusing to run: not a UAT/staging database.', 1;

BEGIN TRAN;
UPDATE cloud.ClientDealer
SET dealerName = SUBSTRING(dealerName, 17, 4000)          -- prefix '0000 DEMO-DRIFT ' is 16 chars
WHERE dealerName LIKE '0000 DEMO-DRIFT %';

UPDATE cloud.Client SET status = 701 WHERE clientId = 380 AND status = 702;   -- only what the seed set
COMMIT;

SELECT (SELECT COUNT(*) FROM cloud.ClientDealer WHERE dealerName LIKE '0000 DEMO-DRIFT %') AS dealers_still_drifted,  -- expect 0
       (SELECT status FROM cloud.Client WHERE clientId = 380) AS client_380_status;                                     -- expect 701
