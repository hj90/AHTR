# Allied Health PDF Filler - Local v0

This is a local-only prototype for filling predefined allied health PDF forms in the browser. It lets a clinician start the SIRA Allied Health Treatment Request form, enter values through normal web fields, review them, generate a completed PDF with `pdf-lib`, and download it.

## Local-Only Scope

Nothing in this v0 lives in Cloudflare. There is no hosted deployment, backend API, database, worker, storage bucket, analytics tool, or AI service. Run it from localhost while validating the workflow.

## V1 Privacy Architecture

- Patient/form values stay in React/browser memory for the active page session.
- Values are not sent to an application backend.
- There is no patient database or completed-PDF storage.
- Generated PDF bytes are held in browser memory as a temporary Blob URL until cleared.
- There is no AI integration.
- Refreshing or closing the page clears entered values.

## Local Development

```bash
npm install
npm run dev
```

The app will be available at the local Vite URL, usually `http://127.0.0.1:5173`.

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
npm run test:e2e
```

The end-to-end test records app-controlled network requests and checks that distinctive fake form values do not appear in request URLs, request bodies, or app-controlled headers.

## PDF Templates

The active PDF is `public/templates/sira-allied-health-treatment-request-form.pdf`, copied from the supplied SIRA form. Its mapping lives in `src/forms/templates/siraAlliedHealthTreatmentRequest.ts`.

A synthetic demo fixture is still present for tests and fallback development.

Use:

```bash
npm run inspect-pdf -- public/templates/your-form.pdf
```

If AcroForm fields exist, map to field names. If the PDF is flat, use coordinate overlays. Never commit completed PDFs or real patient information.
