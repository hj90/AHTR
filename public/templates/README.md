# PDF Templates

The app currently includes two official blank templates:

- `sira-allied-health-treatment-request-form.pdf` for NSW
- `worksafe-victoria-allied-health-recovery-management-plan.pdf` for Victorian work-injury claims
- `workcover-queensland-provider-management-plan.pdf` for Queensland workers' compensation claims
- `workcover-western-australia-physiotherapy-treatment-management-plan.pdf` for Western Australian physiotherapy claims

Transport-accident claims are shown as coming soon and do not yet have a template.

The folder also includes `demo-allied-health-referral.pdf`, a synthetic fixture created by `npm run create-demo-template`. When Poppler or the macOS image converter is available, the same script also renders `demo-allied-health-referral-preview.png` for fixture preview work.

When adding or replacing a PDF:

1. Place the blank PDF in this folder.
2. Run `npm run inspect-pdf -- public/templates/your-form.pdf`.
3. If AcroForm fields are listed, map field IDs to those field names in `src/forms/templates/`.
4. If no fields are listed, configure coordinate overlay mappings manually.
5. Use synthetic test values only when validating the mapping.

Do not add completed PDFs or real patient details to this repository.
