# Vendor creation: integration and automation report

Assessment: 7 October 2026. Target: https://benefit-uat.aspireasia.net. Scope: general vendors, Thai RSA providers and auto dealers. CMC interpreted as Kontent.ai CMS. This is a readiness assessment plus test design, not a successful-creation certification.

## Dependency-aware field input exercise

Follow-up input run, 7 October 2026. ABF logic was read before choosing the order. 20 text/rich-text values were entered and retained after blur. In addition: English selected; Client availability selected; two distinct clients and their dependent programs chosen; three contact phone prefixes set to (+66); extra email/phone/contact/client rows exercised; visible rich-text bold formatting applied; both logo/gallery uploads finalized with HTTP 200 and one CMS asset each. These are input/upload results, not a saved-vendor or SQL consistency pass.

The required Vendor Information controls still remain disabled after selecting English. Thus primary category/subcategory cannot be selected; category-specific/RSA vehicle/dealer fields cannot be revealed. Vendor ID and Vendor CMS ID are correctly read-only generated fields, not failures. Hidden Quill helper fields/native selects are not user inputs. Save stayed disabled and was not submitted.

ABF dependency order: English + Create policy -> editable vendor information; Category -> filtered Subcategory -> category_module_mappings/vendor identity -> category-specific module fields; completed category pair -> additional category; Client availability -> Client -> available Programs; repeat contact -> country prefix -> phone number; file -> presigned URL -> S3 PUT -> CMS finalize -> preview/asset ID. Current status/country defaults remain Active/Thailand.

![Populated dependent fields and upload previews](evidence/full-input/all-fields-populated.png)

Inputs are synthetic QA values; no vendor was created. Uploading immediately creates staged storage files/CMS assets even without Save. The final asset IDs are recorded in the field table and ignored cleanup manifest. Multiple input passes were used; known earlier finalized asset IDs are also retained for reviewed cleanup. This is a change from the original read-only readiness run, which did not perform CMS writes.

Upload response contract: /api/vendors/kontenai/generic/images/uploadCMS returns message and data, not a Succeeded flag. Verified nonempty asset IDs and preview, not merely HTTP status. The earlier checker was corrected; successful finalization must not be reported as a CMS failure.

Final client selections: VIETCOMBANK -> Viecombank Visa Dining; VISA -> Visa Dining. No availability mapping was persisted because vendor Save was not performed. Six mailing values, eight contact values and six descriptive/policy values were retained. Raw trace/video/network/final-fields are in evidence/full-input; these local files are excluded from Git. Detailed results: FIELD-INPUT-REPORT.md. Repeat with npm run test:vendor:fill; that command uploads synthetic assets.


## Outcome and evidence limits

Four of five vendor checks passed; VC-002 failed because Vendor Name stayed disabled for 30 seconds with English selected. The same disabled-field failure reproduced on two runs. Login setup passed: Playwright total 5 passed / 1 failed in 2.1 minutes on the final rerun. No vendor creation POST or CMS/business-data write was performed. Disabled controls were not bypassed.

The saved token includes Permissions.Vendors.View and Permissions.Vendors.Create, plus Edit/Delete/Archive/Export/Import. A missing Create claim alone does not explain this issue. Exact cause remains unconfirmed: inspect deployed frontend, language state, authorization state and initialization exceptions. Do not report a confirmed permissions root cause.

AWS STS reports an expired session; no Benefit tunnel was observed on ports 3374/3375. No live SQL SELECT was executed. CMS Management publish/rollback, RSA MSSQL and server logs were not verified. Public CMS Delivery and UI lookup responses were measured successfully; these do not prove write capability or database integrity.

## Executed results

| Check | Result | Evidence / limit |
|---|---|---|
| Login setup | Passed | Supplied UAT account signs in; ignored local session saved. No secret included here. |
| VC-001 create form / empty Save | Passed | Blank form visible; Save disabled as expected for missing fields. |
| VC-002 editable Vendor Name | Failed | Received disabled across 62 locator observations during 30-second wait. English shown. |
| VC-003 application lookup results | Passed | Captured vendor initialization responses HTTP 200 and Succeeded=true. |
| VC-004 CMS Delivery connectivity | Passed | One correctly typed published sample each for vendor_group_list, country_list, template_generic. Not total counts/integrity. |
| VC-005 anonymous route | Passed | Fresh context sees Sign In, no Vendor Information. |
| Valid vendor creation | Blocked / not run | Required input disabled; no vendor created. |
| MySQL/RSA post-create queries | Blocked / not run | No active authenticated connections; SELECT templates supplied, not executed. |
| CMS Management / faults | Not run | Management access unavailable; fault cases need isolated environment. |

Create-page lookup measurements: countries array 249, user countries 5, CMS languages 4, vendor_status options 3, availability options 2. All ten captured initialization responses succeeded. These are response-array sample lengths, not business database totals. Group/country CMS wrappers succeeded but were not counted. See evidence/network.json and evidence/cms-delivery.json.

## Screenshots

![English creation form after readiness wait](evidence/03-field-readiness.png)

English / Thailand form after VC-002 wait. Grey required fields are visible. Header/navigation are masked. DOM assertion proves Vendor Name is disabled; grey styling alone is not proof.

![Blank-form Save disabled](evidence/02-save-disabled.png)

Empty-form Save disabled is expected; the unexpected behavior is inability to enter the required vendor name.

## Integration flow

1. ABF loads user permissions/countries, CMS languages/group/country items and field options, and Benefit init data; category/subcategory determines module fields.
2. UI validates name/email/status/category/subcategory/availability, and dealership group conditionally; checks duplicate name/dealer code/RSA username. Payload has VendorRequest, TemplateGeneric, Modules, LanguageLocale.
3. POST /api/vendors/v2 calls VendorCmsOrchestrator. Server prechecks dealer-code/RSA-username uniqueness before touching CMS.
4. Create template_generic in vendors collection; optional RSA vehicles and modules in modular_block; update and publish module/vehicle/vendor language variants and links.
5. Insert vendors, vendor_category_mappings, vendor_mailing_details and applicable vendor_client_program_mappings in a MySQL transaction. Check selected client/program relationships.
6. For Thai RSA identities only, call ProviderSyncDataVer2 or DealerSyncInfoVer2 before final DB commit; persist returned external IDs.
7. Return application success, show creation toast and navigate by CMSId; verify vendor list/detail and dependent consumers read the same fixture.
8. Later location creation is separate: publish location/parent CMS links and best-effort vendorproductcitys mirror. It is not part of initial create transaction.

| Integration point | Required assertion | Automation / current verification |
|---|---|---|
| JWT/market authorization | View/Create, allowed market, fresh claims, anonymous/direct API denial | Automatable; login/claims/anonymous measured. Full role matrix needs accounts. |
| Runtime configuration | Actual API host; correct CMS/DB/RSA target; no prod routing | Read-only automation; UAT API host observed; AWS settings blocked. ABF config comes from API, not S3 appsettings. |
| Master data/modules | MasterCode to CmsModuleCodename; every category/subcategory and dynamic field set | Automatable; local code inspected, full live matrix not run. |
| Vendor API | HTTP plus Succeeded/messages/Data; returned IDs; duplicate policy | Lookup envelopes measured; create not run. HTTP 200 can contain application failure. |
| CMS Management | Environment, collections, explicit language/workflow, IDs, module/vehicle links, publish state | Automatable with key; blocked. Delivery existence alone does not prove explicit workflow state. |
| CMS Delivery/CDN | Exact new CMSId/type/language/links with bounded propagation | Reachability measured; fixture integrity not run. Freshness header avoids stale cached responses. |
| Benefit MySQL | One vendor; same CMSId; market/status/mappings/external IDs; no orphan rows | SELECT automation feasible; blocked; schema must be verified. |
| Asset path | Presigned API -> S3 PUT -> CMS finalize -> asset links/CDN render | Automatable with synthetic files; not run. Endpoint source inspected. |
| RoadSide provider | cloud.UserAccount identity/active/mobile/group/note; CMS/external ID match | Automatable with MSSQL/log access; not run; local RSA source resolves mobile flag from CMS. |
| Provider vehicles | CMS links and RSA ownership/service associations | Automatable with access/fixture; not run. |
| RoadSide dealer | cloud.ClientDealer vendorCmsId/clientId/active and returned dealer ID | Automatable; not run. Local mapping Honda HOT / Mercedes MBZ / Porsche PTH. |
| Location mirror | Published location, vendor link, vendorproductcitys.CmsItemCodename and picker | Separate operation; automatable; not run. |
| Read consumers | Vendor search/detail; product/promotion/location and RSA provider/dealer pickers | Deterministic reads automatable; new-fixture checks not run. |
| Logs/reconciliation | Request, runId, CMSId, Benefit/RSA IDs, observable failure cleanup | Automatable with access; not run. |

No evidence in inspected initial creation path of automatic email/notification/payment or mobile push. Do not invent these integrations. Real provider login, GPS/push and job behavior belong to downstream VC-053. Legacy POST /api/vendors and bulk upload are alternative ingestion paths, not dependencies of v2 creation; design separate parity regressions.

## Source-derived risks, not proven live defects

- New DB vendor Status is hard-coded Active while selected CMS status is submitted; compare allowed non-Active creation (VC-036).
- CleanupCreatedCmsItemsAsync ignores DeleteItemAsync Result.Succeeded; DeleteItemAsync catches errors and returns failure, so cleanup may silently fail (VC-045).
- RSA can commit before MySQL final commit; CMS compensation alone cannot undo an independently created RSA record (VC-044).
- UI checks vendor-name duplicates; server orchestrator prevalidation checks dealer code/RSA username, not name. Define name policy and test races (VC-009/047).
- CMS module item names append module type to vendor name; test main/module length limits independently (VC-012).
- Uploaded assets are not in the orchestrator content-item compensation list (VC-026).
- Location DB mirror is explicitly best-effort and can fail while CMS succeeds (VC-028).
- Historical notes differ from local code: Porsche maps PTH and mobile flag handling exists locally. Verify deployed versions instead of treating historic bugs as current facts.

## Automation assessment

| Classification | Cases | Meaning |
|---|---|---|
| Automated now | 5 | Read-only readiness/CMS checks; 4 passed, 1 failed. |
| Automatable with access/data | 30 | Technically feasible UI/API/CMS/SQL cases; not implemented/executed. Need editable UI, accounts, synthetic fixtures, access and cleanup. |
| Isolated environment only | 15 | Backend mocks/fault injection or dedicated environment. Browser interception cannot simulate server-side SQL/CMS/RSA failure. |
| Human-led | 3 | Business/legal content; full usability/accessibility acceptance; release/environment approval. Evidence collection still automatable. |
| Hybrid/manual device | 1 | Deterministic provider/device checks automatable; actual field quality and operational acceptance need people. |

Blocked today does not mean impossible to automate. Database, CMS Management and RSA checks are technically automatable once access is ready. Human review decides commercial/legal suitability, real operational quality and approval; automated rules/text comparisons/screenshot diffs support but do not supply these decisions.

## Detailed cases and prerequisites

TEST-CASES.md provides 54 individually numbered cases, priorities, prerequisites, steps, expected results, integration points, automation category and execution status. test-cases.json is machine-readable. VC-001 through VC-005 ran as readiness tests. The follow-up field script exercised input/upload portions of VC-019, VC-023 and VC-024; these are marked partially executed. Other full creation/failure cases remain unexecuted.

Use UAT AspireProdBackup, RSA BKKRsaStaging and verified CMS 225b0999-fce9-02b4-c44b-ed6990faeeaa. SIT/UAT share CMS; pre-prod may point at production CMS and is excluded. Resolve numeric references by CountryCode, ClientCode, ProgramNumber, MasterCode. Use unique QA_VENDOR_<runId> names, qa-vendor@example.invalid, synthetic contact/images, unique provider/dealer codes and agreed cleanup/retention. No customer data.

## SQL checks and evidence procedure

The two db-checks SQL files are SELECT-only templates, not executed results. Connect explicitly to UAT; verify live schema first; replace <CMS_ID> with exact returned synthetic fixture ID. Zero rows with unreplaced placeholders are not a pass. Scripts include database identity, column metadata, targeted vendor/mapping/location/external ID counts and relationship checks.

For each create case: retain runId/submitted synthetic values, HTTP envelope/IDs, exact-ID SQL comparisons, explicit CMS Management language/workflow, bounded Delivery graph polling, UI/consumer reload and server correlation. Pass only when all applicable points agree. Assert RSA absence for normal/non-Thai cases. For failure cases inspect every created ID and transaction remnant; preserve unresolved IDs for owner-reviewed cleanup. CMS compensation does not imply RSA/S3/location rollback. Do not use an unverified delete endpoint as a complete cleanup strategy.

## Reproduce and next actions

Run npm run test:vendor. Setup logs in; trace/screenshot/video enabled for UI tests. VC-004 is API-only: request trace is meaningful, browser screenshot/video is not. Suite deliberately fails VC-002 until Vendor Name is editable. TypeScript checks passed.

1. Resolve disabled field in deployed UAT; compare language/component initialization, exceptions and authorization state. Root cause unconfirmed.
2. Refresh AWS/open UAT tunnel 3375 and establish read-only CMS Management, RSA MSSQL and log access. No automatic auth repair/environment changes performed.
3. Verify configuration/schema and fixture cleanup; implement VC-006 first with CMS/MySQL assertions, then providers/dealers/assets/locations/consumers.
4. Run isolated failure/race cases and reconcile all side effects.
5. Obtain BA decisions on duplicate names, non-Active creation, unmapped groups and cleanup; obtain human content/usability/release sign-off.

## Sources and confidence

Source-derived expectations do not prove deployed UAT behavior. Live findings have test/network/screenshots. No creation, live SQL, Management publish or RSA synchronization was verified.

- ABF AddVer2.razor:1 route/View; :1564 readiness; :1751 init/Create; :1972 validation; :2217 save. VendorInformation.razor:323 English/name gating is a candidate path, not proven cause.
- ABF VendorManager.cs:713 CMS lookups; :875 presigned; :886 finalize.
- ABVB VendorCmsOrchestrator.cs:44 create; :384 uniqueness; :424 vehicles; :552 cleanup. VendorService.cs:2653 DB creation; :3043 dealer; :3253 provider.
- ABVB AspireBaseContext.cs:184 vendors; :321 locations; :415 category modules; :477 vendor categories; :532 client/program; :558 mailing.
- ABVB CmsService.cs:250 create; :330 variant update; :625 delete. VendorLocationService.cs:791 best-effort mirror. VendorController v2 POST invokes orchestrator; location endpoint is separate.
- ABMB ProviderSyncBenefitController.cs:241 dealer; :495 provider callbacks.
- [Roadside use vendor from CMS, Confluence audit 16 September 2026](https://internationalsos.atlassian.net/wiki/spaces/AD/pages/6838452246/Roadside+use+vendor+from+CMS): historical architecture, not UAT deployment proof. Page read successfully; discovery was partial due to Trello downstream error.
- [Kontent Delivery content items](https://kontent.ai/learn/docs/apis/delivery-api/content-items): freshness header/pagination.
- [Kontent Management publishing](https://kontent.ai/learn/docs/apis/management-api-v2/publishing): workflow permissions and restrictions.
- ai-workspace/access/ACCESS.md and project memory: environment routes/shared CMS/runtime config/JWT. Historic facts need live revalidation.

Coverage includes all integrations found in inspected v2 create and immediate asset/location/read flows; unknown/differently deployed integrations are not claimed. Report excludes secrets/tokens/customer rows. Login traces may contain credentials; keep raw artifacts local. Report screenshots mask identity/navigation; raw evidence is ignored by Git.
