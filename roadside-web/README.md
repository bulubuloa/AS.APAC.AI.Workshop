# RoadSide web (MSU agent portal) - Playwright smoke suite

Runs against the live UAT portal (`roadside-uat.aspireasia.net`). Nothing is stubbed. Every test - passed or
failed - records a trace, screenshots and a video, and every run produces an HTML report.

## Setup (once)

```bash
cd ai-workshop/roadside-web
npm install
npx playwright install chromium      # behind Zscaler: NODE_EXTRA_CA_CERTS=~/.aws/ca-bundle.pem npx playwright install chromium
cp .env.example .env                 # then fill RSA_USER / RSA_PASSWORD (UAT account) - .env is git-ignored
```

## Run

```bash
npm test                 # all 13 tests, serial, ~1 min
npm run test:headed      # watch the browser
npm run test:ui          # Playwright UI mode (pick tests, step through)
npm run report           # open playwright-report/index.html (trace viewer, screenshots, videos inline)
```

Outputs: `playwright-report/` (HTML, open with `npm run report`), `reports/junit.xml` (CI), `reports/results.json`,
`test-results/<test>/` (trace.zip, video.webm, screenshots per test). `npx playwright show-trace test-results/<test>/trace.zip`
opens one trace directly.

## Test cases - 5 features, 13 checks

| Spec | Case | What it proves |
|---|---|---|
| `01-login` | TC01.1 | valid user/password lands on `/msu/joblst` |
| | TC01.2 | wrong password stays on `/auth/login` and shows the server message |
| `02-dealer` | TC02.1 | GAN > Client Dealer filters by client; every row is that client's |
| | TC02.2 | dealer detail opens with the same code and name as the list row (read-only: CMS-synced) |
| `03-provider` | TC03.1 | GAN > Provider User lists with Id / User name / Display name / Group name / Status |
| | TC03.2 | provider detail shows the same user and display name; the Mobile Provider flag is present |
| `04-announcement` | TC04.1 | list loads with Create and the table headers |
| | TC04.3 | **creates** a Draft `[AUTO-TEST] <stamp> announcement`; it appears in the list with a success message |
| | TC04.2 | its detail page shows title, Draft badge and content |
| `05-job` | TC05.1 | job list search by id shows the job |
| | TC05.2 | job detail opens from the list with the id badge, insert date, Save and Job Track |
| | TC05.3 | **creates** a job (client -> program -> tier -> privilege -> service, customer `[AUTO-TEST]`) and lands on `/msu/job/<newId>` |

`auth.setup.ts` signs in once and stores the session in `auth/state.json` for the `msu` project.

## Demo: green run, a data bug, red run

The workshop demo uses the **real, unchanged suite**. Only the data changes.

| Step | Do | Expect |
|---|---|---|
| 1 | `npm test` | all 13 pass |
| 2 | `npm run demo:seed` (runs `demo-data/seed-demo-bugs.sql` on RSA UAT `BKKRsaStaging`; credentials in `demo-data/.db.env`, git-ignored) | dealer 376 `0000 DEMO-DRIFT 0824 01`, client 380 status `702` |
| 3 | `npm test` | **2 failed** (TC02.2, TC05.3), 11 passed |
| 4 | `npm run report` | open the two failures: error, screenshot, video, trace |
| 5 | `npm run demo:revert` | `dealers_still_drifted = 0`, `client_380_status = 701` |
| 6 | `npm test` | all 13 pass again |

What the seed changes, and why the tests catch it:

| Test | Data change | Why it fails | Real-world cause it represents |
|---|---|---|---|
| **TC02.2** dealer detail matches the list | one CMS-linked Honda dealer renamed in `cloud.ClientDealer` to `0000 DEMO-DRIFT <name>` | the list reads the RSA DB name, the detail shows the CMS name: `Expected "0000 DEMO-DRIFT 0824 01" Received "0824 01"` | dealer renamed in the CMS, the Benefit → RSA dealer sync failed |
| **TC05.3** create a job | `cloud.Client.status` for client 380 set from 701 to 702 | the job form lists client 380 but **disabled**: `client 380 cannot be selected for a new job - inactive in RSA? Expected: enabled, Received: disabled` (the server would also reject the save: `Cannot proceed the job for non-active client`) | client active in Benefit, but RSA never got the status (client sync) |

Notes:
- Both scripts refuse to run unless the database name contains `Staging` or `Uat`, and both run in a transaction.
- The seed aborts if client 380 is not active (701) to start with, so the revert only puts back what the seed changed.
- While seeded, **nobody can create a Honda (380) job on UAT**. Seed right before step 3 and revert straight after step 4.
- `npm run demo:bugs` runs only the dealer and job specs (faster for step 3).
- `demo-data/.db.env` holds `RSA_DB_SERVER`, `RSA_DB_NAME`, `RSA_DB_USER`, `RSA_DB_PASS` (sqlcmd from the MS ODBC client tools is used).
- Rehearsed end to end on 2 Oct 2026: 13 passed → seed → 2 failed / 11 passed → revert → 13 passed.

## Data written on UAT

Only the two `create` cases write: one Draft announcement and one job per run, both tagged `[AUTO-TEST]` in every
free-text field so they can be found and cleaned up. Nothing is dispatched, approved or deleted.

## Environment-specific values (`.env`)

- `RSA_TEST_JOB_ID` - an existing job to open (default `26JB048514`).
- `RSA_TEST_CLIENT_ID` - client used for filters and job creation (`380` = Honda on UAT).
- `RSA_TEST_PROGRAM` - program **name** for job creation; it must have a privilege on the target environment
  (on UAT only the test programs do: `HOT UAT Program`, `Meo Roadside program`, `Vit roadside program`, `Duck program`).
  Leave it blank and the suite scans the client's programs for the first one with a privilege.

## Layout

```
pages/        page objects (LoginPage, JobPages, DealerPages, ProviderPages, AnnouncementPages)
tests/        auth.setup.ts + one spec per feature
playwright.config.ts   serial, trace/screenshot/video on, HTML + JUnit + JSON reporters
```

## Gotchas found while writing it

- The job page's cascading selects are filled by ajax on `change`, and the page init also reloads the program list -
  select, then wait for the specific response (`GetListProgramByClientId`, `GetListCustomerTierByProgramId`,
  `GetListPrivilegeByProgramId`, `rendersvctypeoption`), not for network idle.
- A rejected job save answers `200 {success:false,error:"..."}` and `alert()`s it; the test captures the dialog and
  puts the server message in the failure.
- A successful save navigates immediately - read the POST body inside the `response` event, not after `waitForResponse`.
- The client `<select>` label sometimes carries the id suffix `(380)`; the list table never does.
- Dealer edit has no Save button (commented out in the view) - dealers come from the CMS sync.
