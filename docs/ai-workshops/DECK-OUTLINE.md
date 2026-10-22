# QA automation presentation outline

## 1. QA automation: tools and POC results

- RoadSide web • Benefit admin • Aspire Partner Android
- Decision evidence and a staged pipeline plan
- 8 October 2026

## 2. Requirements behind the tool choice



Browser navigation | RSA dealer detail opens in a new tab
Business assertions | Dealer code/name; vendor values versus CMS
Evidence | HTML/JUnit, screenshots, trace and video
Execution control | Required pack count and failure/skip gate
Native Android | Login, vehicle, fresh OTP and dashboard

Playwright for web; Appium + WebdriverIO for native mobile.

## 3. Playwright: popup detail and field assertions

- Apache-2.0; $0 core framework fee
- Built-in runner, HTML/JUnit and traces
- Our RSA popup test compares code and name

Existing executable example: roadside-web / TC02.2

## 4. Selenium: established language and Grid assets

- Apache-2.0; $0 core framework fee
- Good fit for an existing Java/C# ecosystem
- Runner and evidence conventions need assembly

Can test the same values; no comparative run was performed.

## 5. Cypress: interactive single-tab workflow

- MIT; Cypress App is free
- Cloud recording is an optional service
- RSA new-tab checks use a plugin or adaptation

Strong frontend alternative; our popup fits Playwright directly.

## 6. Robot Framework: keywords over Playwright

- Apache-2.0 core and Browser library
- Readable keywords for QA authoring
- CMS/DB helpers still need custom integration

A different authoring layer; Browser uses Playwright underneath.

## 7. Katalon: guided authoring and object repository

- Vendor commercial terms; local Free tier
- Recorded flows and curated test objects
- CI requires a Runtime Engine add-on

Consider when low-code and vendor support outweigh added licensing.

## 8. Appium + WebdriverIO: native Android control

- Appium Apache-2.0; WebdriverIO MIT
- UiAutomator2 drives native screens
- Existing vehicle/OTP helpers can be reused

Retain for Aspire Partner; a browser viewport is not native evidence.

## 9. Maestro: concise mobile smoke flows

- Apache-2.0; local CLI free
- YAML for a readable native journey
- Our fresh-OTP helper needs adaptation

Candidate mobile alternative; not benchmarked against our Appium pack.

## 10. Web licensing and optional cloud costs



Playwright / Selenium / Robot | $0 core fee | CI, storage and engineering extra
Cypress App | $0; MIT | Cloud optional
Cypress Cloud Team | $799/year | 120k results/year in annual plan
Cypress Cloud Business | $3,199/year | 120k results/year; extra usage
Katalon Professional | $2,199/seat/year displayed | $1,000 eligible promotion; CI add-on

Checked 8 Oct 2026. Free execution does not mean zero operating cost.

## 11. Mobile and workload cost examples



Appium/WDIO on own emulator | $0 core; runner and device operation extra
Maestro: 2 concurrent cloud devices | 2 × $250 = $500/month
3 Katalon Professional authors | 3 × $2,199 = $6,597/year standard basis
100 cases × 10 daily runs × 22 days | 22,000 results/month; 264,000/year
Cypress Team at assumed volume | 144k/year above included 120k

Assumptions for budgeting, not measured spend or savings.

## 12. Why we choose Playwright for web

- The actual RSA popup workflow already has reviewed assertions.
- Benefit creation/detail checks demonstrate CMS value comparison.
- One runner produces inspectable HTML/JUnit and retained evidence.
- Existing TypeScript examples avoid a migration for this POC.
- No mandatory framework or hosted-report subscription.

A justified project fit; no universal speed or cost superiority is claimed.

## 13. Codex and Claude: evidence from different workloads



Attribution | Reported in company source | This working session
Output | 61 cases → 71 tests reported | Creation + Save/detail/CMS checks
Last result | 57 passed / 14 skipped reported | TC002 + setup passed; 19 comparisons
Scope | RSA catalogue subset | Benefit vendor workflow
Interpretation | No matched benchmark | No agent winner established

Test execution time is not AI authoring productivity.

## 14. What worked and what needed correction

- Source review corrected NEW badge expectations.
- Search/prefix rules were identified.
- Accounts, identity and fixtures blocked 14 tests.

Human review and valid environment access were necessary in both POCs.

## 15. A fair agent benchmark

- Use the same five reviewed cases, repo commit and UAT fixtures.
- Provide equal access, permissions and authoring time.
- Record model version, prompts and human interventions.
- Measure accepted-test time, false defect reports and seeded-fault detection.
- Capture actual billed usage and maintenance after a UI change.

Choose an authoring standard after matched evidence; keep one reviewed runtime.

## 16. Recommended tools and their boundaries



Web regression | Playwright Test | Existing popup and vendor POC
Native Android | Appium + WebdriverIO | Resource IDs and native screens
AI authoring | Continue controlled dual-tool pilot | No matched Codex/Claude result
CMS / database verification | API + read-only adapters | Access and correlation required
Physical service acceptance | Operational observation | Digital status is not service proof

Choose the runtime per system and review the generated business assertions.

## 17. Save success and resulting vendor detail



Synthetic vendor 20415; 19 CMS-to-rendering comparisons passed.

## 18. A green test can still leave integration gaps

- TC002 compares CMS values with the rendered detail.
- The corrected full BenefitDB replay remains incomplete after AWS expiry.
- Vendor 20414 payload had blank optional mailing/restaurant collections.
- A blank request matching a blank stored value does not prove input retention.
- Add reviewed UI-to-payload and DB/CMS checks before broad coverage claims.

Separate app defects, test defects and environment blockers.

## 19. RSA catalogue and implementation coverage



Catalogue | 449 cases / 22 sheets | Business case inventory
Implemented | 61 cases → 71 tests | 13.6% case implementation
Last reported run | 57 pass / 14 skip / 0 fail | Not complete product coverage
Not started | 388 cases | Not evidence of impossibility
300 of 400 | Unverified | Need workbook version and case IDs

Do not present the unverified 300/400 figure as measured coverage.

## 20. Saved workshop and Benefit results



RSA runnable inventory | 13 tests: 12 functional + setup | Measured test listing
Saved RSA run, 7 Oct | 6 pass; 38.882 seconds | 5 functional + setup
Benefit UI, 8 Oct | 2 pass; 286.861 seconds | TC002 + setup
Benefit CMS rendering | 19 comparisons passed | One exercised synthetic vendor
Mobile archived reports | 3 passing checks | No fresh combined run

Inventory, executed tests and assertions are different units.

## 21. How to report completion without inflating it

- Implemented coverage = unique implemented cases / catalogued cases.
- Executed coverage = unique executed cases / catalogued cases.
- Pass rate = passed tests / executed tests, with skips shown separately.
- Track setup tests, assertions and repeated runs outside business-case totals.
- Publish case IDs, pack version, source SHA and latest artifact links.

Reconcile the actual 400-case pack before claiming 75% completion.

## 22. The 14 reported skips have enabling conditions



Role/agent/inactive/impersonation accounts | 9 | Dedicated approved UAT accounts
Okta test identity | 2 | Approved identity/session design
Signed authentication hash | 1 | Controlled minting fixture
Reference/assigned-truck jobs | 2 | Reproducible fixture relationships

Missing prerequisites are blocked automation, not inherently manual cases.

## 23. Full automation and conditional integration checks

- CRUD, filtering and negative validation
- Dealer popup and dependent selections
- Save/detail with known expected values

Resolve credentials, test data and network routes; use bounded polling.

## 24. Partial automation: messages, devices and dispatch



OTP / notifications | Request, event and newer test SMS row | Physical handset delivery
GPS / camera / background | Appium harness on controlled device | Field/network/OS experience
Roadside dispatch | Assignment and digital status transitions | Travel, towing and actual service
Visual / accessibility | Rule checks and approved screenshot diffs | Usability and baseline judgement

Mocks prove a contract path; they do not prove the external service happened.

## 25. Manual portions and a clear unblock plan

- Real MFA approval and CAPTCHA remain human actions in that process.
- Physical service quality and subjective usability require acceptance checks.
- Unreviewed cases remain “not assessed,” not “cannot automate.”
- For each case, record owner, blocker, enabling action and acceptance evidence.
- Split manual portions from the automated surrounding application checks.

Assess the remaining scope case by case rather than labeling a whole remainder manual.

## 26. Pipeline plan: target execution sequence



Deploy approved SIT/UAT build | Target URL and deployed source/version
Preflight | Account, fixtures, DNS/TLS and DB route
Required smoke pack | Complete count and per-case results
API / CMS / SELECT checks | Correlated independent expected values
Report and quality gate | Restricted evidence; fail/skip/incomplete rejection

Proposed flow; no new cloud QA pipeline was deployed.

## 27. Local pipeline POC and result gate

- Draft CodeBuild buildspec and JUnit output
- Five local gate policy checks
- Saved 6-test RSA run rejected when 13 required
- Saved 2-test Benefit pack accepted when 2 required

Local gate proof does not establish hosted CI integration.

## 28. Draft runner commands and unattended prerequisites

- Use locked dependencies and compatible browser image
- Use a runner/VPC route, not a desktop tunnel
- Run controlled create packs without automatic retry

Last two lines form one command; see attached source package for executable YAML.

## 29. Milestones before making it a release gate



Freeze reviewed pack | Case manifest and executable inventory
Prove one hosted run | Run ID, SHA, counts and artifacts
Prove defect detection | Isolated before/fault/after with cleanup
Stabilize | Proposed: 10 unattended runs, no unexplained skips
Enable triggers | Post-deploy smoke, nightly regression, release pack

QA owns triage; add native mobile and contract coverage separately.

## 30. Decisions and evidence to collect next

- Adopt Playwright for new RSA/Benefit web checks; retain native Appium coverage.
- Use matched evidence before choosing Codex or Claude as the authoring standard.
- Reconcile the 400-case workbook and its implemented/passed case IDs.
- Complete the pending BenefitDB consistency replay.
- Run one controlled CI pilot and retain fault-detection proof.

All six topic pages and workshop repositories are linked in the speaker notes.
