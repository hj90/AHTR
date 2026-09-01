# Localhost v0 Runbook

This v0 is intentionally local-only. Nothing is deployed to Cloudflare, no Cloudflare Access policy is configured, and no Cloudflare storage or worker is used.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite localhost URL shown in the terminal.

## Local Build Preview

```bash
npm run build
npm run preview
```

The production build is static output in `dist/`, served locally by Vite preview.

## Access Control Status

The original V1 spec recommends infrastructure-level access control for a deployed app. Because this v0 is localhost-only, there is no application login and no internal user database.

Before any public or shared deployment, choose and configure an external access gate separately. Do not add a custom patient/user database to this app to solve access control for V1.

## Verification Before Sharing Beyond Localhost

- Confirm the app is static-only.
- Confirm there are no backend routes or serverless functions.
- Confirm no patient values are persisted to browser storage.
- Confirm generated PDFs are not uploaded.
- Confirm an external access gate protects the hostname before real users enter real data.
