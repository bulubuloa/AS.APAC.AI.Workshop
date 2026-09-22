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
