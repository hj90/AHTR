# PDF Templates

This local v0 uses `sira-allied-health-treatment-request-form.pdf` as the active template. It was copied from the supplied SIRA Allied health treatment request form.

The folder also includes `demo-allied-health-referral.pdf`, a synthetic fixture created by `npm run create-demo-template`. When Poppler or the macOS image converter is available, the same script also renders `demo-allied-health-referral-preview.png` for fixture preview work.

When adding or replacing a PDF:

1. Place the blank PDF in this folder.
2. Run `npm run inspect-pdf -- public/templates/your-form.pdf`.
3. If AcroForm fields are listed, map field IDs to those field names in `src/forms/templates/`.
4. If no fields are listed, configure coordinate overlay mappings manually.
5. Use synthetic test values only when validating the mapping.

Do not add completed PDFs or real patient details to this repository.
