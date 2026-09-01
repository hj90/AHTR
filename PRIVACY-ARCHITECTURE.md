# Privacy Architecture

This document describes the technical data flow for the local v0. It is not a legal policy.

## Data That Enters The Application

Clinicians type form answers into browser controls. The demo fields are synthetic placeholders until the real PDF template and mapping are supplied.

## Where Form Data Lives

- React state in browser memory for the active page session.
- Temporary PDF bytes in browser memory during generation.
- A temporary Blob/Object URL after generation so the clinician can download the PDF.

## Where Form Data Does Not Go

- No application database.
- No application API.
- No server PDF processor.
- No analytics or session replay service.
- No AI provider.
- No file-storage service.
- No URL query parameters or fragments.
- No localStorage, sessionStorage, IndexedDB, Cache Storage, cookies, or service-worker storage.

## Clearing Data

`Start a new form` clears form values and revokes the generated PDF Object URL. Refreshing or closing the page also clears entered values because they are not persisted by the app.

## Persistent Non-Patient Data

This local v0 does not configure an external identity provider. If the app is later protected by external access infrastructure, that provider may retain authentication-related records such as user identity and access events. Those records are separate from form content.
