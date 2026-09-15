# Privacy Architecture

This document describes the technical data flow for the current build. It is not a legal policy.

## Data That Enters The Application

Clinicians enter form answers directly or draft them from consultation notes. Consultation notes are sent to the drafting API and its configured AI provider for extraction. The original notes are not saved with the form submission.

## Browser-Persisted Form Data

- Structured form values are autosaved to browser local storage.
- The selected form template, practice state, draft/submitted status and timestamps are stored with the structured values.
- A successful PDF generation marks the saved request as submitted.
- Practitioner settings remain in the existing `users` table.

Saved requests are available only in the same browser profile. Clearing the browser's site data permanently removes them, and they are not available on another device.

## Data That Is Not Persisted

- Original consultation notes.
- Generated PDF files.
- Temporary PDF Blob/Object URLs.
- Form values in URL query parameters or fragments.

## PDF Generation

PDFs are generated in browser memory from the saved structured values. The application does not upload the generated PDF to file storage.

## Deletion

Users can permanently delete saved requests from the home screen.

## Operational Requirements

- Browser storage is intended for development and synthetic test data. It is not suitable for reliable cross-device storage or long-term retention of real patient records.
- Moving submissions to Supabase later will require authenticated ownership, row-level security and an explicit retention policy.
