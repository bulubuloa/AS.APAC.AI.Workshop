
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

TEST-CASES.md provides 54 individually numbered cases, priorities, prerequisites, steps, expected results, integration points, automation category and execution status. test-cases.json is machine-readable. Only VC-001 through VC-005 have run; the remaining cases are specifications marked Not run.

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
