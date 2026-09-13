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

## Supabase Demo Configuration

For the online demo branch, browser-side Supabase access uses only the project URL and publishable key:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_publishable_key \
npm run dev
```

You can also put those values in `.env.local`. The app intentionally does not expose `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or any `sb_secret_...` value to the browser bundle.

The demo stores reusable practitioner settings in `public.users` against a single hard-coded UUID:

```text
11111111-1111-4111-8111-111111111111
```

Apply the migration in `supabase/migrations` before using Settings save/clear against a fresh Supabase project. You can run it through the Supabase SQL editor, the Supabase CLI, or this helper when `SUPABASE_DB_URL` or `SUPABASE_ACCESS_TOKEN` is available:

```bash
npm run supabase:apply-demo-migration
```

For `SUPABASE_DB_URL`, use the direct database connection string if your network supports IPv6. On IPv4-only networks, use the Supabase Shared Pooler / Supavisor session-mode connection string from the dashboard instead.

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

The state selected in Settings determines the active form. NSW uses the SIRA Allied Health Treatment Request, Victoria uses the official WorkSafe Allied Health Recovery Management Plan, and Queensland uses WorkCover Queensland's Provider Management Plan (Form 32). Their mappings live in `src/forms/templates/`.

Apply the practice-state migrations to persist the selection in Supabase. Until then, the state selection falls back to browser storage while the other practitioner settings continue to use the existing database schema.

A synthetic demo fixture is still present for tests and fallback development.

Use:

```bash
npm run inspect-pdf -- public/templates/your-form.pdf
```

If AcroForm fields exist, map to field names. If the PDF is flat, use coordinate overlays. Never commit completed PDFs or real patient information.
