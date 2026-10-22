# Benefit frontend tests

Playwright suite for Benefit UAT with traces, screenshots, and video for every test. Evidence appears as attachments in the HTML report.

## Setup

Use Node.js 20 or newer. Run npm install, then npx playwright install chromium. Copy .env.example to .env and set BENEFIT_USERNAME and BENEFIT_PASSWORD for automatic login.

The base URL is https://benefit-uat.aspireasia.net. The originally supplied https://benefit-uat.aspire.net returned a certificate name mismatch; HTTPS validation remains enabled.

## Commands

- `npm test`: five public tests, login setup, and authenticated account test.
- `npm run test:smoke`: public tests only; no credentials needed.
- `npm run test:authenticated`: fresh login setup and account test.
- `npm run test:headed`: watch public tests.
- `npm run test:ui`: test explorer.
- `npm run typecheck`: check TypeScript.
- `npm run report`: HTML report with screenshots, video, and trace viewer.

## Authentication and evidence

The setup project signs in through the UI and saves auth/state.json. Authenticated tests depend on it. Fresh login picks up Benefit permissions from the JWT. The account test only inspects the page. Public tests do not submit reset requests or business changes.

.env, saved sessions, test-results, reports, and playwright-report are ignored by Git. Login traces include entered credentials, and evidence may contain tokens or customer information. Keep artifacts local and review before sharing.

For interactive manual session capture, run `npm run auth:save`. To use that session without fresh login, run `npx playwright test --project=authenticated --no-deps`.

Add page objects under pages/ and tests under tests/. Update testMatch for new authenticated spec filenames. Agree on test records before adding workflows that change data.

## Vendor assessment

Run npm run test:vendor for five read-only vendor readiness/CMS checks plus login setup. Detailed cases, SQL templates and illustrated report are in docs/vendor-creation. Current readiness check fails on disabled Vendor Name; successful creation/live SQL are not verified. Generated evidence stays local.

## Fill accessible vendor fields

Run npm run test:vendor:fill to follow ABF dependencies and populate available fields, repeated contacts/client rows, programs and synthetic image uploads. It does not click Save. Uploads immediately create staged files/CMS assets even without saving a vendor. Field-level results, final values and trace/video/screenshots are in ignored docs/vendor-creation/evidence/full-input. See FIELD-INPUT-REPORT.md for the measured coverage and disabled controls.

## Creation TC in Playwright

Run npm run test:creation (also npm test). It runs login setup plus TC-VENDOR-CREATE-001. The test fills available inputs, verifies readiness/read access before Save, saves once and compares the returned CMSId across BenefitDB and CMS. Attachments include the specification, field values, screenshots and a comparison table. Traces/videos are recorded. Blocked prerequisites cause a failed test with a BLOCKED annotation; unexecuted comparison stages are explicitly Not run. Provide the read-only DB variables from .env.example locally. Only SELECT statements are used for database checks. The test creates a synthetic vendor/assets through the UAT application when prerequisites allow it; no automatic destructive cleanup.

TC-VENDOR-CREATE-002 checks Save success, detail navigation and CMS rendering. Run npm exec playwright test -- --project=creation --grep TC-VENDOR-CREATE-002. TC-VENDOR-CREATE-001 can use scripts/run-creation-aws.cjs for in-memory UAT credentials; an active AWS login and tunnel 3375 are required.
