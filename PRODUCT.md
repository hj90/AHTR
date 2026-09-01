# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript, Vite, and pdf-lib, delegated by the build specification and local-only v0 request. The v0 runs on localhost and does not include Cloudflare, backend, database, or AI services.

## Users

Australian allied health clinicians trialling whether purpose-built web entry is faster and easier than manually typing into PDF forms.

## Product Purpose

The product lets an approved clinician choose a predefined allied health PDF form, enter details through normal web controls, review the values, generate a completed PDF in the browser, and download it. V1 success means the workflow feels simpler while preserving the rule that patient/form data never leaves the browser.

## Positioning

A lightweight browser-only PDF filler for predefined allied health forms, designed for validation without a patient database, backend processor, analytics service, or AI data flow.

## Operating Context

The local v0 is used from a developer machine at `localhost`. Future production access control is expected to be handled outside the frontend by infrastructure-level access gating, but this local version intentionally has no Cloudflare-hosted component. The app now uses the supplied SIRA Allied health treatment request PDF as its active template.

## Capabilities and Constraints

Users can start the SIRA Allied health treatment request form, complete required fields, review grouped answers, generate a PDF locally with pdf-lib, download it with a generic filename, and clear in-memory state. Form values must not be written to localStorage, sessionStorage, IndexedDB, cookies, URLs, logs, analytics tools, APIs, or backend services. Refreshing or closing the page clears entered values. The app must not implement AI, OCR, practice-management integrations, patient search, drafts, history, storage, payments, or team administration in v0.

## Evidence on Hand

The source implementation brief is `allied-health-pdf-v1-codex-build-spec.md`. The supplied real template is `public/templates/sira-allied-health-treatment-request-form.pdf`, copied from `/Users/minjieshi/Desktop/Codex/NoMorePDF/SIRA-Allied-health-treatment-request-form.pdf`. No logo, brand assets, production access configuration, or customer proof has been supplied.

## Product Principles

Keep patient/form data in browser memory only.
Prefer a small static app over infrastructure.
Make completion and review clearer than editing the PDF directly.
Keep the form/template architecture replaceable when the real PDF arrives.
Make privacy limits factual and specific, without legal/compliance claims.

## Accessibility & Inclusion

The app should support keyboard use, semantic labels, visible focus states, accessible validation errors, adequate tap targets, desktop and tablet workflows, and a usable mobile layout.
