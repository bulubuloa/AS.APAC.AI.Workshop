# TC-VENDOR-CREATE-001 - Create vendor and compare BenefitDB with CMS

## Objective

Create one general vendor through Benefit UAT, then verify the submitted values against BenefitDB and Kontent.ai CMS using the returned CMSId. This case covers creation and stored-result comparison only.

## Preconditions

- Benefit UAT: https://benefit-uat.aspireasia.net; English; an approved market and Vendors.View/Create permissions.
- Vendor Name, Email and category controls are editable. Published normal category/subcategory and module mapping exist.
- Read-only access to Benefit UAT schema AspireProdBackup and the configured UAT CMS environment. Revalidate target configuration before execution.
- Resolve category, country, client and program IDs within UAT. Use unique synthetic data and agreed test-record retention.

## Test data

| Field | Value |
|---|---|
| Vendor Name | QA_VENDOR_CREATE_<runId> |
| Status | Active |
| Category / subcategory | One valid general-vendor pair with a published mapped module |
| Country | Same country as selected user market; Thailand for the current session |
| Email | qa.vendor@example.invalid |
| Phone | (+66), 812345678 |
| Website | https://example.com |
| Office address | 123 QA Test Street, Bangkok |
| Mailing | QA Recipient; 123 QA Test Street; QA District; QA Subdistrict; Bangkok; 10110 |
| Availability | Client; one approved test client and one of its valid programs |
| Key contacts | Synthetic names/emails; select phone prefix before entering numbers |
| Content fields | Synthetic description, short description, tips, terms, cancellation and fulfilment instructions |
| Logo / gallery | Synthetic QA PNG files |
| Category-specific fields | Valid synthetic values required by the chosen mapped module |

## Steps

1. Sign in. Select Thailand in the top-right global country filter, then open /vendors-ver2/add. Select English and reload before entering values.
2. Fill status, category, then subcategory; wait for category-specific fields to load and fill them. Complete all other applicable fields using the test data.
3. Select Client availability, choose a client, then its program. Add the intended mailing/contact details; choose phone prefixes before numbers.
4. Upload logo/gallery and wait for returned asset IDs and visible previews. This endpoint returns message/data, not a Succeeded envelope.
5. Capture the completed form and the submitted creation payload. Click Save once.
6. Verify POST /api/vendors/v2 returns application Succeeded=true and Data.Id/Data.CMSId. Verify the creation success message and detail navigation.
7. Use that exact CMSId to read the vendor in BenefitDB and CMS. Do not match records by vendor name alone.
8. Retrieve CMS English content and linked category module. Allow bounded published-content propagation. Use Management read access to verify the explicit variant/workflow when available; Delivery fallback alone is not that proof.
9. Compare the fields below against the submitted values. Record Expected / BenefitDB actual / CMS actual / Result. Capture the saved detail page and sanitized comparison evidence.

## BenefitDB-to-CMS comparison

| Check | BenefitDB | CMS | Expected comparison |
|---|---|---|---|
| Identity | vendors.CMSId | item.system.id | Same GUID; one active/nondeleted DB row for the returned CMSId |
| Vendor name | vendors.FullNameEN | elements.vendor_name.value | Both equal submitted name after DB trim |
| Office address | vendors.Address and AddressEN | elements.office_address.value | Both equal submitted office address |
| Phone number | vendors.MobilePhone | elements.phone_number.value | Same submitted number; CMS phone_code checked separately because DB does not store that prefix here |
| Country / market | vendors.CountryId resolved through country master data | vendor_country linked item's country_code | Both resolve to selected market country; compare semantic country code, not DB ID to CMS item ID |
| Status | vendors.Status resolved to Active | elements.vendor_status option codename | Both represent Active |
| Category/subcategory | vendor_category_mappings joined to masterdatas | category_text/sub_category_text and linked module | Same selected category/subcategory; compare resolved names/codes |
| Category module | vendor_category_mappings.CmsModuleCodename | linked module.system.type | Same module TYPE codename; a linked ITEM codename is not the type codename |
| Availability | vendor_client_program_mappings.ClientId/ProgramId resolved to client/program names | availability choice and client_availability_config | Exactly the selected pair, no duplicate mappings; same semantic client/program scope |

## Fields without a direct cross-store mirror

These fields must be verified against their intended store and the submitted value, not falsely reported as missing in the other store.

| Field group | Check |
|---|---|
| Email, website, descriptions, tips, terms, cancellation, fulfilment | CMS elements equal submitted content; no corresponding write in the inspected v2 DB creation mapping |
| Logo / gallery | CMS asset IDs equal successful upload IDs; linked previews render; current v2 create does not populate legacy DB image-list fields |
| Vendor group | CMS linked group equals selection when used; v2 create does not populate legacy vendors.GroupId |
| Key contacts | vendors.KeyContactEN JSON equals submitted contact structure; TemplateGenericRequest does not expose a corresponding CMS contact field |
| Mailing details | vendor_mailing_details equals submitted address; no corresponding TemplateGeneric CMS mailing field |
| Database ID | vendors.Id equals response Data.Id; CMS has its own GUID, so these IDs are not expected to be equal |

If the product requirement demands any of these fields in both stores, record that as a mapping requirement gap; do not assume the current implementation meets it.

## Pass criteria and result record

Pass only when Save succeeds, exactly one DB vendor matches the returned CMS item, all applicable shared comparisons agree, store-specific fields equal the submitted data, and the saved UI reads the same vendor. Missing, inconsistent or duplicate records fail the comparison. Unavailable reads are Blocked, never Passed.

| Stage | Current result |
|---|---|
| Populate accessible inputs | 20 text/rich-text values retained; dependent client/program/contact inputs exercised; logo/gallery finalized |
| Create vendor | Required inputs become editable after selecting global Thailand, selecting English and reloading. See latest Playwright stage results for Save readiness. |
| Compare saved BenefitDB/CMS vendor | Not executed: no vendor/CMSId created; database access also unavailable |
| Overall TC status | Blocked; no creation or DB/CMS consistency pass claimed |

For an executed run, record runId, response Id/CMSId, selected market, submitted values, expected/actual comparison rows, screenshots and trace/video. Keep credentials and raw customer/session data out of shared evidence.

![Current input evidence before creation](evidence/full-input/all-fields-populated.png)

This screenshot demonstrates input coverage only. It is not evidence of a saved vendor.

## Source mapping

- ABF AddVer2.razor SubmitAsync and VendorHelpers.UpdateDealerInformation build the common values and create payload.
- ABVB VendorCmsOrchestrator.RegisterVendorAsync creates/publishes CMS and assigns CMSId before database persistence.
- ABVB VendorService.RegisterVendorVer2Async defines DB fields and category/client-program/mailing inserts.
- ABVB TemplateGenericRequest defines CMS element codenames and fields.

