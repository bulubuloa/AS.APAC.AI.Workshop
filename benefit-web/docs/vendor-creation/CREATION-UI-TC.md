# TC-VENDOR-CREATE-002 - Save success and detail rendering against CMS

Create one synthetic vendor through Benefit UAT. Verify the application reports success, opens the created vendor detail page, and renders values from the matching published English CMS item.

1. Sign in; select Thailand in the top-right country filter. Open creation, select English and reload.
2. Fill required values, valid dependent dropdown options, accessible contact/content fields and synthetic logo/gallery.
3. Click Save once. Verify POST /api/vendors/v2 succeeds and returns vendor Id/CMSId.
4. Verify the visible message "Vendor successfully created" and capture a screenshot.
5. Verify navigation to /vendors-ver2/<CMSId>, a visible vendor name and Vendor Information section.
6. Load the published English CMS item using that exact CMSId. Allow publication propagation.
7. Compare the visible name, CMSId, status, group, category/subcategory, email, phone/prefix, address, country and website with CMS.
8. Compare rendered descriptions/policies/instructions with CMS text, and logo/gallery counts, sources and successful image loading.
9. Attach expected/actual field results, screenshots, trace and video to the standard Playwright report.

Pass only when success is shown, the correct detail page is visible, and all checked rendered values match CMS. Store the returned test-record IDs for later reviewed cleanup. Database writes occur only through the application.

Automated: all steps above once authentication and application/CMS availability are working. Human prerequisite: interactive authentication when sessions expire. This TC does not read BenefitDB; TC-VENDOR-CREATE-001 performs that comparison.

Run: `npm exec playwright test -- --project=creation --grep TC-VENDOR-CREATE-002`.
