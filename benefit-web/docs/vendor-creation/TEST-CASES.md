# Vendor creation test cases

54 cases, assessed 7 October 2026. Scope: general vendors, RSA providers and auto dealers. CMC interpreted as Kontent.ai CMS. VC-001 through VC-005 are implemented readiness checks. Follow-up script partially exercised VC-019/023/024 inputs/uploads; saved creation and fault cases remain unexecuted.

## Shared prerequisites and test data

Use Benefit UAT aspireasia.net, MySQL AspireProdBackup, RSA BKKRsaStaging and verified CMS 225b0999-fce9-02b4-c44b-ed6990faeeaa. SIT and UAT share CMS. Pre-prod may share production CMS: never use it for this suite. Resolve IDs by CountryCode, ClientCode, ProgramNumber and MasterCode. Use unique QA_VENDOR_<runId> names, qa-vendor@example.invalid, synthetic contact/image data and unique provider/dealer identifiers. Use sequential runs and agreed fixture retention/cleanup. No customer data.

## Automation categories

- Automated now: 5.
- Automatable with access/data: 30.
- Isolated environment only: 15.
- Human-led: 3.
- Hybrid/manual device: 1.

Conditional automation is technically feasible but not implemented/executed yet. Isolated cases require backend mocks/fault control, not browser-only interception. Human-led means judgment/approval; evidence collection can still be automated.

## VC-001 Create form and empty Save

- Area / priority: Readiness / P0.
- Automation: Automated now.
- Execution: Passed.
- Preconditions: UAT account; English; Thailand.
- Integration points: UI, authentication

Steps:

1. Open /vendors-ver2/add.
2. Wait for Vendor Information and Save.
3. Inspect empty Save.

Expected: Create form visible; Save disabled for missing required data.

## VC-002 Authorized field readiness

- Area / priority: Readiness / P0.
- Automation: Automated now.
- Execution: Failed.
- Preconditions: JWT includes Vendors.View and Vendors.Create; English.
- Integration points: UI, permissions, localization

Steps:

1. Open creation page.
2. Resolve Vendor Name by label.
3. Wait 30 seconds for enabled input.

Expected: Input editable after initialization. Actual: remained disabled over 62 observations.

## VC-003 Application lookup success

- Area / priority: Readiness / P0.
- Automation: Automated now.
- Execution: Passed.
- Preconditions: Authenticated browser.
- Integration points: API, CMS, Benefit read path

Steps:

1. Capture initialization responses.
2. Inspect get-by-cmsid/0, languages, CMS items/field-values.
3. Check HTTP and result envelope.

Expected: All captured responses HTTP 200 and Succeeded=true; not just HTTP success.

## VC-004 CMS published-content connectivity

- Area / priority: Readiness / P0.
- Automation: Automated now.
- Execution: Passed.
- Preconditions: Shared SIT/UAT CMS Delivery endpoint.
- Integration points: CMS Delivery

Steps:

1. GET one depth=0 item for vendor_group_list, country_list and template_generic.
2. Use freshness header.
3. Verify status and requested item type.

Expected: Nonempty correctly typed published sample for each; not proof of creation or total integrity.

## VC-005 Anonymous creation-route protection

- Area / priority: Readiness / P0.
- Automation: Automated now.
- Execution: Passed.
- Preconditions: New context without local storage or cookies.
- Integration points: UI, authentication

Steps:

1. Open creation route.
2. Wait for Sign In.
3. Confirm Vendor Information absent.

Expected: Anonymous visitor cannot see create form.

## VC-006 Minimum valid vendor creation

- Area / priority: General / P0.
- Automation: Automatable with access/data.
- Execution: Blocked: required Vendor Information disabled.
- Preconditions: Editable form; published normal category/subcategory; unique synthetic fixture.
- Integration points: UI, API, CMS, MySQL, RSA exclusion

Steps:

1. Choose normal category, Active, Global, market.
2. Enter QA_VENDOR_<runId> and qa-vendor@example.invalid.
3. Save once; capture POST /api/vendors/v2 envelope and IDs.
4. Compare CMS and SQL by returned CMSId.

Expected: Succeeded=true; exactly one vendor and published template_generic; correct category module/market/links; no RSA record for normal vendor.

## VC-007 Mandatory fields

- Area / priority: Validation / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Otherwise valid fixture; test each required field separately.
- Integration points: UI validation, API exclusion, DB/CMS exclusion

Steps:

1. Clear name, email, status, category, subcategory or availability.
2. Blur and inspect validation.
3. Attempt Save only if enabled; observe POST traffic.

Expected: Save disabled or field-specific error; no create POST, DB row or CMS item.

## VC-008 Email syntax and whitespace name

- Area / priority: Validation / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Editable valid fixture.
- Integration points: UI validation, API

Steps:

1. Try malformed email and whitespace-only name.
2. Blur.
3. Inspect validation and Save.

Expected: Invalid email and blank name rejected; no side effects.

## VC-009 Duplicate vendor name

- Area / priority: Validation / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Existing synthetic vendor in same market.
- Integration points: UI duplicate lookup, API, MySQL, CMS

Steps:

1. Try exact duplicate, case variant and trimmed variant.
2. Submit UI.
3. Repeat direct API in isolated fixture.
4. Compare counts.

Expected: Duplicate policy enforced consistently; no extra DB/CMS records. UI checks name, server prevalidation does not currently check name: BA policy required.

## VC-010 Duplicate dealer code

- Area / priority: Validation / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Existing synthetic dealer code.
- Integration points: Server prevalidation, MySQL, CMS, RSA

Steps:

1. Submit UI and API with same dealer code.
2. Capture result.
3. Compare CMS/DB/RSA counts.

Expected: Failure before CMS creation; existing dealer untouched; no duplicate record.

## VC-011 Duplicate RSA username

- Area / priority: Validation / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Existing synthetic provider username.
- Integration points: Server prevalidation, MySQL, CMS, RSA

Steps:

1. Submit provider with same username through UI/API.
2. Capture result.
3. Compare CMS/DB/RSA counts.

Expected: Rejected before creating CMS content; no duplicate provider or orphan item.

## VC-012 Name and serialized contact boundaries

- Area / priority: Validation / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Live constraints measured; synthetic fixture.
- Integration points: UI, API, CMS item limits, MySQL

Steps:

1. Exercise names around 200 characters, also considering module suffix.
2. Exercise KeyContact/KeyContactEN serialized JSON around 4000 characters.
3. Inspect rejection and cleanup.

Expected: Clear limit errors; no truncation/orphans. FullNameEN model max=200; service contact limit=4000; CMS module item names need separate boundary check.

## VC-013 Unicode and rich-text round trip

- Area / priority: General / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Normal test category.
- Integration points: UI, serialization, CMS variants

Steps:

1. Use Thai/Vietnamese/accented name and supported rich text.
2. Save and reload.
3. Compare CMS fields and rendered content.

Expected: Unicode and supported formatting preserved; HTML follows agreed sanitization rules.

## VC-014 Every category/module mapping

- Area / priority: Categories / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Live category_module_mappings catalog resolved by MasterCode.
- Integration points: Master data, mapping API, MySQL, UI/CMS switch

Steps:

1. Enumerate category/subcategory pairs.
2. Select each and inspect dynamic fields.
3. Create minimal fixture for each supported module.

Expected: Correct field set/content type; matching DB CmsModuleCodename and linked module; unsupported pair handled clearly.

## VC-015 Multiple categories and removal

- Area / priority: Categories / P1.
- Automation: Automatable with access/data.
- Execution: Blocked: primary category/subcategory disabled.
- Preconditions: Two valid categories.
- Integration points: UI wrappers, Modules payload, CMS, MySQL

Steps:

1. Add/fill two category modules.
2. Remove one before Save.
3. Inspect payload, CMS and category rows.

Expected: Only retained modules/rows persist; no stale link or unused module created.

## VC-016 Missing mapping

- Area / priority: Categories / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Dedicated fixture; never change shared master data to induce failure.
- Integration points: Master data, API mapping, CMS types

Steps:

1. Load category without mapping.
2. Inspect form/Save/error.
3. Submit unsupported module type in backend integration test.

Expected: Explicit failure; no fake generic success or orphan CMS/DB record.

## VC-017 Global visibility

- Area / priority: Availability / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Editable normal-vendor fixture.
- Integration points: UI, CMS, vendor_client_program_mappings

Steps:

1. Choose Global.
2. Save.
3. Compare CMS availability/config and targeted client/program rows.

Expected: Global persists; CMS client config empty; no unintended restriction/placeholder mappings.

## VC-018 Client-wide visibility

- Area / priority: Availability / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Resolved valid synthetic client; no programs selected.
- Integration points: Client API, CMS, MySQL

Steps:

1. Choose Client and one client.
2. Save.
3. Inspect CMS config and DB mapping.

Expected: Exactly one client row with ProgramId=NULL; client text consistent; no duplicate mapping.

## VC-019 Selected client/program pairs

- Area / priority: Availability / P1.
- Automation: Automatable with access/data.
- Execution: Partially executed: two client/program choices; no Save/SQL.
- Preconditions: Resolve ClientCode/ProgramNumber and valid associations.
- Integration points: Client/program APIs, CMS, MySQL

Steps:

1. Select two programs of one client.
2. Save and reload.
3. Compare DB pairs and CMS description.

Expected: Only selected valid pairs persisted once; UI/CMS/DB agree.

## VC-020 Wrong-client program association

- Area / priority: Availability / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Dedicated fixture; environment-specific IDs resolved.
- Integration points: MySQL validation/FK, CMS compensation

Steps:

1. Submit program belonging to a different client.
2. Inspect application failure.
3. Inspect DB rollback and created CMS items.

Expected: Invalid association rejected; no vendor/mapping row or orphan CMS content.

## VC-021 Country, market and scope consistency

- Area / priority: Market / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Two authorized markets and a restricted-market account.
- Integration points: JWT, country API, EF filters, MySQL, CMS

Steps:

1. Create within permitted market.
2. Try mismatched payload country and cross-market identifiers.
3. Compare current market, DB CountryId and CMS country.

Expected: Server enforces scope; no unintended cross-market record; duplicate scope agreed; never reuse numeric IDs across environments.

## VC-022 English and additional variants

- Area / priority: Language / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: English creation; edit permissions for localized variant.
- Integration points: Language UI, CMS Management/Delivery

Steps:

1. Create in English.
2. Verify explicit published variant through Management.
3. Add local-language variant through edit.
4. Read exact language with fallback awareness.

Expected: Creation is English; localization preserves nonlocalizable links; Delivery fallback not mistaken for an explicit variant.

## VC-023 Mailing and multiple contacts

- Area / priority: Contacts / P1.
- Automation: Automatable with access/data.
- Execution: Partially executed: mailing/repeat contacts retained; no Save/SQL.
- Preconditions: Synthetic address/email/phone only.
- Integration points: UI repeaters, API, MySQL, CMS

Steps:

1. Fill mailing address and ZIP.
2. Add multiple emails/phones and second contact.
3. Save/reload; inspect serialized KeyContactEN and mailing rows.

Expected: Correct contact JSON/order and mailing count; no accidental empty placeholder data.

## VC-024 Logo/gallery upload end to end

- Area / priority: Assets / P1.
- Automation: Automatable with access/data.
- Execution: Partially executed: S3/CMS asset finalize passed; no vendor Save/link verification.
- Preconditions: Small synthetic PNG/JPG; storage/CMS upload access.
- Integration points: UI, S3, CMS assets/CDN, vendor asset API

Steps:

1. Upload logo and gallery.
2. Observe presigned API, S3 PUT and finalize.
3. Save.
4. Verify asset IDs and rendered files after reload.

Expected: Upload/finalize succeed; submitted links are finalized CMS asset IDs; visible after reload. Do not share signed URLs.

## VC-025 File extension/size boundary

- Area / priority: Assets / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Synthetic files; UAT displays 25 MB maximum.
- Integration points: UI validation, upload API, CMS assets

Steps:

1. Try unsupported extension and just-over-limit image.
2. Try exact-limit image.
3. Check error and requests.

Expected: Invalid files rejected before upload; exact byte convention measured; boundary valid file accepted.

## VC-026 Upload failure and abandoned assets

- Area / priority: Assets / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Controllable S3/finalize errors; synthetic assets.
- Integration points: S3, CMS assets, cancel, cleanup

Steps:

1. Fail upload then finalize independently.
2. Cancel after upload succeeds.
3. Inspect temporary objects and CMS assets.

Expected: No fake upload success; retry works; retention/cleanup defined. Content-item compensation does not track uploaded assets.

## VC-027 Separate location creation and mirror

- Area / priority: Locations / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Existing synthetic vendor; location operation after initial create.
- Integration points: Location API, CMS, MySQL, picker

Steps:

1. Create location/address/coordinates through UI.
2. Read CMS location and parent link.
3. Query vendorproductcitys by CmsItemCodename.
4. Read picker.

Expected: Published location linked once; DB mirror row agrees; picker returns it. This is not part of initial create transaction.

## VC-028 Location mirror failure

- Area / priority: Locations / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Isolated DB fault.
- Integration points: CMS, vendorproductcitys, logs

Steps:

1. Create/publish location with DB mirror failure.
2. Inspect result and logs.
3. Compare missing mirror row and recovery path.

Expected: CMS success not confused with DB consistency; best-effort mirror failure observable and recoverable.

## VC-029 Thai provider identity sync

- Area / priority: RSA provider / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Thailand/provider category; unique test username; RSA UAT online.
- Integration points: ProviderSyncDataVer2, CMS, MySQL, RSA MSSQL

Steps:

1. Create provider with RSA/contact fields.
2. Capture callback evidence.
3. Compare CMS, vendors and cloud.UserAccount.

Expected: One account with matching vendorCmsId/BenefitVendorId/name/username/mobile/active; CloudAccIdExternal equals accountId.

## VC-030 Mobile flag, group and note

- Area / priority: RSA provider / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Two Thai test providers, mobile yes/no; valid group.
- Integration points: CMS module, RSA flag resolver, dispatch read path

Steps:

1. Create both flags.
2. Compare CMS module and UserAccount.
3. Check group/note and provider picker eligibility.

Expected: CMS and RSA mobile/active flags agree; no drift hiding Auto-mode providers; empty-value policy defined.

## VC-031 Vehicles and services

- Area / priority: RSA provider / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Two unique synthetic vehicle licenses and services.
- Integration points: CMS vehicles, ProviderCarCreateOrUpdateVer2, RSA Vehicle/VehService

Steps:

1. Add two vehicles to RSA module.
2. Save.
3. Compare published vehicle links, cloud.Vehicle ownership and service associations.

Expected: Correct vehicle CMS IDs/owner/services; no duplicates or missing links.

## VC-032 Dealer sync for mapped brands

- Area / priority: RSA dealer / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Thai dealership category; published brand group; RSA clients present.
- Integration points: CMS groups, MySQL, DealerSyncInfoVer2, RSA Client/ClientDealer

Steps:

1. Create Honda, Mercedes and Porsche fixtures.
2. Resolve HOT/MBZ/PTH by client code.
3. Compare IDs, CMS links, client and active flag.

Expected: One dealer per fixture; VendorIdExternal=dealerId; matching vendorCmsId/clientId; no clientId=0. Local Porsche mapping is PTH.

## VC-033 Mandatory dealership group

- Area / priority: RSA dealer / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Valid Thai dealership fixture.
- Integration points: UI identity/group validation, CMS/DB exclusion

Steps:

1. Clear group.
2. Attempt Save.
3. Inspect error and absence of create side effects.

Expected: Group required for dealership; optional for normal vendor.

## VC-034 Unmapped group or missing client

- Area / priority: RSA dealer / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Dedicated brand/client fixtures; no shared client removal.
- Integration points: Brand resolver, RSA Client, result envelope, cleanup

Steps:

1. Use unmapped group, then mapped group with missing RSA client.
2. Capture outcome.
3. Inspect DB/CMS/RSA rollback.

Expected: Current unmapped source path returns success/no-sync: BA acceptance required. Missing mapped client must fail without clientId=0.

## VC-035 Non-Thai RSA category

- Area / priority: RSA routing / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Authorized non-Thai market.
- Integration points: Country gate, MySQL, CMS, RSA exclusion

Steps:

1. Create provider/dealer-category fixture.
2. Inspect callbacks/external IDs.
3. Query RSA by CMSId.

Expected: No RSA callback/record under current Thailand-only gate; intended Benefit/CMS data persists.

## VC-036 Non-Active creation status

- Area / priority: Consistency / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Permitted non-Active creation option; policy agreed.
- Integration points: UI status, CMS, MySQL, RSA

Steps:

1. Create allowed non-Active fixture.
2. Compare CMS status, DB Status and RSA active when applicable.
3. Reload UI.

Expected: Status agrees everywhere. Local DB creation hard-codes Active: source risk, not proven UAT defect.

## VC-037 IDs, collections and linked content

- Area / priority: Consistency / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Successful synthetic fixture.
- Integration points: API, CMS Management/Delivery, MySQL

Steps:

1. Capture CMSId/codename and DB ID.
2. Read collection, module/vehicle links and DB CMSId.
3. Check counts by exact fixture.

Expected: One vendor; vendors/modular_block collections correct; links resolve; CMSId not confused with database ID.

## VC-038 Vendor search/detail and dependent pickers

- Area / priority: Consumers / P1.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Created fixture plus location if needed.
- Integration points: Vendor read APIs, CMS Delivery, dependent pickers

Steps:

1. Search exact fixture name.
2. Open detail by CMSId.
3. Read product/promotion/location and RSA pickers under allowed scope.

Expected: Fixture appears after bounded propagation; correct name/category/availability/IDs; no real privilege, job or redemption required.

## VC-039 CMS initial create failure

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Injected Management API error.
- Integration points: CMS, orchestrator, MySQL, RSA exclusion

Steps:

1. Fail first create with 401/403/5xx.
2. Submit valid payload.
3. Inspect API, DB and callback absence.

Expected: Failure with no vendor, CMS graph or RSA side effects; no success toast.

## VC-040 Vehicle/module/vendor publish failure

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Fault control for each CMS step.
- Integration points: CMS Management, rollback, database exclusion

Steps:

1. Fail vehicle create/publish, module create/publish and vendor publish in separate runs.
2. Track created IDs.
3. Inspect compensation and DB/RSA absence.

Expected: Only newly created content removed; reused vehicles survive; no orphan content or DB/RSA record.

## VC-041 CMS throttling and delivery propagation

- Area / priority: Failures / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Injected 429 or bounded propagation fixture; no shared CMS load test.
- Integration points: CMS rate limits, Delivery CDN, retry policy

Steps:

1. Return 429 with retry hints.
2. Inspect retry/failure and cleanup.
3. After success poll exact item with freshness header and deadline.

Expected: No fake success, duplicate create or endless retry; propagation measured separately from create response.

## VC-042 DB failure after CMS publish

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Injected insert/mapping/commit errors.
- Integration points: MySQL transaction, CMS, orchestrator

Steps:

1. Publish CMS graph.
2. Fail each DB stage independently.
3. Inspect rollback and every created CMS ID.

Expected: No DB remnants and content compensated; asset cleanup handled separately.

## VC-043 RSA callback failure

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Synthetic Thai fixture; controlled timeout/500/application error.
- Integration points: RSA callback, MySQL transaction, CMS cleanup

Steps:

1. Fail provider/dealer callback by each mode.
2. Read API Succeeded.
3. Query exact DB/CMS/RSA IDs.

Expected: No success; Benefit rollback and CMS compensation; external side effects explicitly checked.

## VC-044 RSA success then MySQL commit failure

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Commit failure injected after successful RSA callback.
- Integration points: Distributed transaction boundary, RSA, MySQL, CMS

Steps:

1. Allow RSA creation.
2. Fail final MySQL commit.
3. Inspect all stores and reconciliation.

Expected: No orphan RSA account/dealer or explicit approved recovery. CMS cleanup does not undo independent RSA commit.

## VC-045 CMS compensation returns failure

- Area / priority: Failures / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Late create failure; delete failure as exception and Result.Fail.
- Integration points: CMS delete, compensation, logs

Steps:

1. Trigger compensation.
2. Fail deletion of one created item.
3. Inspect logging, remaining IDs and recovery.

Expected: Cleanup failure and unresolved IDs visible. Source cleanup does not inspect returned Result.Succeeded.

## VC-046 Double-submit and lost response retry

- Area / priority: Concurrency / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Isolated fixture and network control.
- Integration points: UI, API retries, CMS, MySQL, RSA

Steps:

1. Double-click Save during request.
2. Drop response after persistence.
3. Retry same fixture.
4. Compare all-store counts.

Expected: Single logical vendor or deterministic duplicate outcome; no orphan/duplicate graph. UI guard is not an end-to-end idempotency proof.

## VC-047 Concurrent duplicate identifiers

- Area / priority: Concurrency / P0.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Isolated parallel requests; live indexes measured.
- Integration points: API uniqueness, SQL indexes, CMS cleanup

Steps:

1. Submit same dealer code/username concurrently.
2. Collect both results.
3. Inspect indexes and record counts.

Expected: At most one success; no duplicate/orphan; pre-check alone cannot ensure race safety.

## VC-048 View-only and denied-create accounts

- Area / priority: Security / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Separate view-only/create-enabled/unauthorized test accounts.
- Integration points: JWT, UI authorization, API policies

Steps:

1. Compare route, enabled fields and Save.
2. Call API as denied account with isolated fixture.
3. Check no side effects.

Expected: UI/server enforce Create; direct API cannot bypass it; role name alone is insufficient.

## VC-049 Tampered scope and module payload

- Area / priority: Security / P1.
- Automation: Isolated environment only.
- Execution: Not run.
- Preconditions: Synthetic restricted account and invalid references.
- Integration points: API, EF scope, CMS models, SQL FKs

Steps:

1. Submit unauthorized market/client/program IDs.
2. Submit unknown module and missing TemplateGeneric.
3. Inspect result and remnants.

Expected: Server validates references/scope; clear failure; no CMS/DB/RSA remnants.

## VC-050 Correlation and reconciliation

- Area / priority: Observability / P0.
- Automation: Automatable with access/data.
- Execution: Not run.
- Preconditions: Read access to UAT logs/DB/CMS.
- Integration points: API, CloudWatch/Lambda, CMS, MySQL, RSA

Steps:

1. Capture runId, request correlation and returned IDs.
2. Locate CMS/DB/RSA outcomes.
3. Compare reconciliation summary to actual stores.

Expected: All points linked to same fixture; cleanup failures observable; no credential/customer payload in shared logs.

## VC-051 Business and legal content correctness

- Area / priority: Acceptance / P1.
- Automation: Human-led.
- Execution: Not run.
- Preconditions: Approved documents and content owner.
- Integration points: Business content, CMS

Steps:

1. Review terms, cancellation/fulfilment, category and availability against approved source.

Expected: Business owner approves suitability; automation can compare text/presence but cannot give legal/commercial sign-off.

## VC-052 Usability and accessibility acceptance

- Area / priority: Acceptance / P1.
- Automation: Human-led.
- Execution: Not run.
- Preconditions: Browser/keyboard/assistive tech coverage and policy.
- Integration points: UI, accessibility/design

Steps:

1. Review layout, focus, label association, contrast, readability and responsive behavior.
2. Use automated accessibility/image checks as support.

Expected: Human acceptance of full usability; rule checks and screenshot diffs are supporting evidence.

## VC-053 Real provider and device operation

- Area / priority: Acceptance / P1.
- Automation: Hybrid/manual device.
- Execution: Not run.
- Preconditions: Approved provider/device setup and test job.
- Integration points: RSA login, ABMR, GPS/push, dispatch

Steps:

1. Check actual provider login, GPS/background, push and accepting a test job in separate downstream suite.

Expected: Deterministic device/API parts automatable; real field quality and operational acceptance need people.

## VC-054 Release/environment sign-off

- Area / priority: Acceptance / P0.
- Automation: Human-led.
- Execution: Not run.
- Preconditions: Release and environment owners; approved process.
- Integration points: Release governance, environment isolation

Steps:

1. Review environment IDs, deployment/schema drift and UAT evidence.
2. Approve cleanup/promotion.

Expected: Explicit owner approval; no autonomous production mutation or shared CMS fault injection.

