# RoadSide E2E delivery - 22 Oct 2026

Everything for the two end-to-end journeys in one place.

| Folder | What | In git |
|---|---|---|
| `test-suites/` | RoadSide web suite `BkkRSA-Full-Regression-TestCases_v4.5.xlsx` (560 cases; sheet **23-E2E Journeys** = TC-23-001 and TC-23-003 step by step, with 22 Oct results and video times) and app suite `Aspire-Partner-Mobile-Regression-TestCases_v4-e2e.xlsx` (72 cases + sheet 13-E2E Journeys) | yes |
| `slides/` | `RoadSide_E2E_Journeys.pptx` (13 slides) and `RoadSide_E2E_Journeys_with_video.pptx` (same deck, both videos embedded on the demo slide) | deck only, not the video deck |
| `videos/` | Captioned side-by-side recordings (portal left, phone right, step name on top): `TC-23-001-web-and-app.mp4` (2 min 25 s), `TC-23-003-web-and-app.mp4` (55 s) | no |
| `reports/` | Playwright HTML reports with steps, videos and trace (`npx playwright show-report reports/TC-23-001-report`), JUnit XML, step timings | no |

## Results (RSA UAT, 22 Oct 2026)

| Test case | Journey | Result |
|---|---|---|
| TC-23-001 | E2E-01 Job: create, dispatch, driver takes / drives / arrives / photo / finishes, portal CLOSED (11 steps) | PASSED, 3.7 min, job 26JB049155 |
| TC-23-003 | E2E-02 Announcement: publish on the web, News + banner on the phone, switch off, gone (8 steps) | PASSED, 1.6 min |

## Why videos and reports are not in git

This repository is public. The report traces record what the test typed into the portal (including the UAT password) and every API call, and the videos show UAT screens. Share them internally (Teams / SharePoint / Confluence attachment), not through this repo.

Test code: `../roadside-web-app` (steps come from `e2e-steps.json`, the same text as sheet 23 and the slides).
Confluence: [RoadSide end-to-end journeys](https://internationalsos.atlassian.net/wiki/spaces/AD/pages/6939836423).
