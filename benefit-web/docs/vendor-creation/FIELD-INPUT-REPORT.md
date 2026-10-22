# Vendor form input results

## Dependency-aware field input exercise

Follow-up input run, 7 October 2026. ABF logic was read before choosing the order. 20 text/rich-text values were entered and retained after blur. In addition: English selected; Client availability selected; two distinct clients and their dependent programs chosen; three contact phone prefixes set to (+66); extra email/phone/contact/client rows exercised; visible rich-text bold formatting applied; both logo/gallery uploads finalized with HTTP 200 and one CMS asset each. These are input/upload results, not a saved-vendor or SQL consistency pass.

The required Vendor Information controls still remain disabled after selecting English. Thus primary category/subcategory cannot be selected; category-specific/RSA vehicle/dealer fields cannot be revealed. Vendor ID and Vendor CMS ID are correctly read-only generated fields, not failures. Hidden Quill helper fields/native selects are not user inputs. Save stayed disabled and was not submitted.

ABF dependency order: English + Create policy -> editable vendor information; Category -> filtered Subcategory -> category_module_mappings/vendor identity -> category-specific module fields; completed category pair -> additional category; Client availability -> Client -> available Programs; repeat contact -> country prefix -> phone number; file -> presigned URL -> S3 PUT -> CMS finalize -> preview/asset ID. Current status/country defaults remain Active/Thailand.

![Populated dependent fields and upload previews](evidence/full-input/all-fields-populated.png)

Inputs are synthetic QA values; no vendor was created. Uploading immediately creates staged storage files/CMS assets even without Save. The final asset IDs are recorded in the field table and ignored cleanup manifest. Multiple input passes were used; known earlier finalized asset IDs are also retained for reviewed cleanup. This is a change from the original read-only readiness run, which did not perform CMS writes.

Upload response contract: /api/vendors/kontenai/generic/images/uploadCMS returns message and data, not a Succeeded flag. Verified nonempty asset IDs and preview, not merely HTTP status. The earlier checker was corrected; successful finalization must not be reported as a CMS failure.

Final client selections: VIETCOMBANK -> Viecombank Visa Dining; VISA -> Visa Dining. No availability mapping was persisted because vendor Save was not performed. Six mailing values, eight contact values and six descriptive/policy values were retained. Raw trace/video/network/final-fields are in evidence/full-input; these local files are excluded from Git. Detailed results: FIELD-INPUT-REPORT.md. Repeat with npm run test:vendor:fill; that command uploads synthetic assets.


| Element / action | Result | Actual value or reason |
|---|---|---|
| Language prerequisite | Done | English |
| Country | Blocked | Disabled by application |
| Vendor Status | Blocked | Disabled by application |
| Vendor Group | Blocked | Disabled by application |
| Primary Category | Blocked | Disabled by application |
| Primary Sub-Category | Blocked | Disabled by application |
| Add category dependency | Blocked | Disabled: English/category prerequisites unmet |
| Add email | Done | Added repeatable contact control |
| Add phone number | Done | Added repeatable contact control |
| Add additional contact | Done | Added repeatable contact control |
| Client availability prerequisite | Done | Selected Client; client/program fields can now appear |
| Phone country-code prerequisite 1 | Done | (+66) |
| Phone country-code prerequisite 2 | Done | (+66) |
| Phone country-code prerequisite 3 | Done | (+66) |
| vendor_information / Vendor CMS ID [1] | Expected read-only | Generated only after successful creation; not an input prerequisite. |
| vendor_information / Vendor ID [2] | Expected read-only | Generated only after successful creation; not an input prerequisite. |
| vendor_information / Vendor Group [3] | Selection control | Disabled |
| vendor_information / Primary Category* [4] | Selection control | Disabled |
| vendor_information / Primary Sub-Category* [5] | Selection control | Disabled |
| vendor_information / Vendor Name * [6] | Blocked | Disabled by application |
| vendor_information / Email * [7] | Blocked | Disabled by application |
| vendor_information / Phone Number [8] | Blocked | Disabled by application |
| vendor_information / Website [9] | Blocked | Disabled by application |
| vendor_information / Office address [10] | Blocked | Disabled by application |
| mailing_address / Recipient Name [11] | Done | {"entered":"QA Contact 11","retained":"QA Contact 11"} |
| mailing_address / Address [12] | Done | {"entered":"123 QA Test Street, Bangkok","retained":"123 QA Test Street, Bangkok"} |
| mailing_address / District [13] | Done | {"entered":"QA Test District","retained":"QA Test District"} |
| mailing_address / Sub-District [14] | Done | {"entered":"QA Test District","retained":"QA Test District"} |
| mailing_address / Province [15] | Done | {"entered":"Bangkok","retained":"Bangkok"} |
| mailing_address / Zip Code [16] | Done | {"entered":"10110","retained":"10110"} |
| availability / Availability [17] | Selection control | Dependent selection |
| key_contact / Key contact name [18] | Done | {"entered":"QA Contact 18","retained":"QA Contact 18"} |
| key_contact / Key contact email [19] | Done | {"entered":"qa.contact19@example.invalid","retained":"qa.contact19@example.invalid"} |
| key_contact / Key contact email [20] | Done | {"entered":"qa.contact20@example.invalid","retained":"qa.contact20@example.invalid"} |
| key_contact / Key contact phone number [21] | Done | {"entered":"812345678","retained":"812345678"} |
| key_contact / Key contact phone number [22] | Done | {"entered":"812345678","retained":"812345678"} |
| key_contact / Additional contact name [23] | Done | {"entered":"QA Contact 23","retained":"QA Contact 23"} |
| key_contact / Additional contact email [24] | Done | {"entered":"qa.contact24@example.invalid","retained":"qa.contact24@example.invalid"} |
| key_contact / Additional contact phone number [25] | Done | {"entered":"812345678","retained":"812345678"} |
| description / Description [26] | Done | {"entered":"Synthetic vendor profile used only for UAT field testing.","retained":"Synthetic vendor profile used only for UAT field testing."} |
| description / Description [27] | Not a user field | Hidden editor implementation control |
| description / Description [28] | Not a user field | Hidden editor implementation control |
| short_description / Short Description [29] | Done | {"entered":"Synthetic vendor profile used only for UAT field testing.","retained":"Synthetic vendor profile used only for UAT field testing."} |
| insider_tips / Insider Tips [30] | Done | {"entered":"Synthetic QA insider tips.","retained":"Synthetic QA insider tips."} |
| terms_and_conditions / Terms and Conditions [31] | Done | {"entered":"Synthetic UAT test terms. No real contract.","retained":"Synthetic UAT test terms. No real contract."} |
| terms_and_conditions / Terms and Conditions [32] | Not a user field | Hidden editor implementation control |
| terms_and_conditions / Terms and Conditions [33] | Not a user field | Hidden editor implementation control |
| cancellation_policy / Cancellation Policy [34] | Done | {"entered":"Synthetic UAT test cancellation policy.","retained":"Synthetic UAT test cancellation policy."} |
| fulfilment_instructions / Fulfilment Instructions [35] | Done | {"entered":"Synthetic UAT test instructions: confirm with QA.","retained":"Synthetic UAT test instructions: confirm with QA."} |
| Client selection after availability | Done | VIETCOMBANK |
| Program selection after client | Done | Viecombank Visa Dining |
| Add Client repeatable row | Done | Added second client row |
| Second client selection | Done | VISA |
| Second client program dependency | Done | Visa Dining |
| Rich text toolbar select 0 | Not a user field | Hidden native Quill select; visible toolbar buttons exercised. |
| Rich text toolbar select 1 | Not a user field | Hidden native Quill select; visible toolbar buttons exercised. |
| description visible rich-text formatting | Done | Applied bold using visible toolbar |
| terms_and_conditions visible rich-text formatting | Done | Applied bold using visible toolbar |
| logo upload | Done | {"upload":"Finalized synthetic QA PNG","status":200,"assetCount":1,"assetIds":["67a015b5-0e07-5cae-ab91-6df25af481ba"],"message":"Vendor images finalized successfully."} |
| gallery upload | Done | {"upload":"Finalized synthetic QA PNG","status":200,"assetCount":1,"assetIds":["03db104b-be5b-526c-a3f3-1b98cc91c18b"],"message":"Vendor images finalized successfully."} |
| Save | Disabled | Not submitted: this run exercises input controls only |
