# Allied Health PDF Form Filler — V1 Codex Build Specification

## 1. Purpose of this document

This document is the implementation brief for Codex to build the first working version of a lightweight PDF form-filling product for allied health providers in Australia.

The V1 product should let an approved user:

1. Access a private, invite-only web application.
2. Select or open a predefined PDF form.
3. Enter information through a normal, easy-to-use web form.
4. Generate a completed PDF entirely inside the user's browser.
5. Download the completed PDF.
6. Leave no patient/form data stored in the application, database, backend, analytics system, or application logs.

The most important architectural principle is:

> **Patient/form data must never leave the user's browser in V1.**

The product is intended as a low-cost prototype for validation. Expected usage is approximately **200 completed forms per month**, so the architecture should be intentionally simple and inexpensive.

---

## 2. Product goal

The goal of V1 is to validate whether allied health providers find it meaningfully faster and easier to complete an existing PDF form through a purpose-built web interface instead of typing directly into a PDF editor or manually filling the document.

This is not intended to be a practice-management system, patient-record system, document-management system, or AI assistant in V1.

The prototype should optimise for:

- simplicity;
- speed;
- privacy by design;
- minimal infrastructure;
- low operating cost;
- ease of testing with a small number of clinicians;
- easy replacement or addition of predefined PDF templates later.

---

## 3. Hard constraints

These are non-negotiable V1 requirements.

### 3.1 No patient database

Do not create a database for patient details, form answers, generated PDFs, drafts, or submission history.

Do not use:

- PostgreSQL;
- Supabase;
- Firebase/Firestore;
- Azure SQL;
- Cosmos DB;
- Cloudflare D1;
- R2 for completed PDFs;
- S3 for completed PDFs;
- browser-to-server form submission;
- any equivalent persistent patient-data store.

### 3.2 No backend processing of patient data

PDF generation must happen in the browser.

Do not send patient/form data to:

- Cloudflare Workers;
- Azure Functions;
- Vercel Functions;
- any REST API;
- any analytics endpoint;
- any AI/LLM API;
- any third-party form service.

### 3.3 No AI in V1

Do not integrate OpenAI, Anthropic, Gemini, OCR, speech-to-text, automated extraction, or any other AI capability.

AI-assisted form completion can be considered in a later product version after the data-governance architecture has been reviewed separately.

### 3.4 No patient data in browser persistent storage

Do not put form values in:

- `localStorage`;
- `sessionStorage`;
- IndexedDB;
- Cache Storage;
- service-worker storage;
- cookies;
- URL query parameters;
- URL fragments;
- persisted client-side state libraries.

Form values should live only in normal in-memory application state for the current page session.

Refreshing or closing the page should clear the entered data.

### 3.5 No patient-data analytics

Do not install Google Analytics, Hotjar, FullStory, Mixpanel, Amplitude, Sentry session replay, Microsoft Clarity, or similar tooling in V1.

If telemetry is later added, it must be deliberately reviewed before implementation.

### 3.6 No form-value logging

Do not log form values to the browser console in production.

Never include patient/form values in exceptions, debug messages, error reporting, URLs, filenames, or build logs.

### 3.7 Invite-only access

The deployed application must be protected by an external access gate so only specifically approved users can open it.

Recommended implementation:

- Cloudflare Pages for static hosting;
- Cloudflare Access / Zero Trust for the access gate;
- approved individual email addresses;
- email one-time PIN or another configured identity provider;
- no shared clinic-wide password.

Authentication is infrastructure-level. The frontend application itself should not implement a custom authentication database.

---

## 4. Recommended technology stack

Use the following unless an existing repository already has an equivalent modern stack.

### Frontend

- React
- TypeScript
- Vite
- CSS Modules, plain CSS, or a lightweight styling approach
- `pdf-lib` for client-side PDF modification

Avoid adding a heavy UI framework unless it materially speeds implementation.

### Testing

- Vitest for unit tests
- React Testing Library for component tests
- Playwright for end-to-end browser tests

### Hosting

- Cloudflare Pages

### Access control

- Cloudflare Access / Zero Trust

### Dependency principle

Keep dependencies minimal. Do not add a dependency for functionality that can reasonably be implemented with the browser or existing stack.

Do not load production JavaScript libraries from third-party CDNs. Bundle dependencies into the application at build time.

---

## 5. Target architecture

```text
Approved clinician
       |
       v
Cloudflare Access
(email/identity gate)
       |
       v
Cloudflare Pages
(static HTML/CSS/JS + blank PDF template)
       |
       v
User's browser
       |
       +--> React web form
       |      |
       |      v
       |   in-memory state only
       |      |
       |      v
       +--> pdf-lib loads blank PDF template
              |
              v
         form values inserted locally
              |
              v
         completed PDF bytes generated
              |
              v
         browser download

No patient-data API
No patient database
No completed-PDF storage
No AI API
```

The application may retrieve static assets from its own deployed origin, including the blank PDF template. It must not send form values back to the origin.

---

## 6. V1 user journey

### Step 1 — Authentication

A user visits the product URL.

Cloudflare Access should intercept the request before the application loads.

Only approved users should be permitted.

Example flow:

```text
Open URL
  -> Cloudflare Access sign-in
  -> enter approved email
  -> receive OTP / authenticate
  -> Access policy passes
  -> application loads
```

Cloudflare configuration is outside the React application and should be documented in `DEPLOYMENT.md`.

### Step 2 — Start a form

The user sees a simple page containing:

- product title/logo placeholder;
- short explanation;
- the available predefined form(s);
- a `Start form` button.

For the first implementation there may be only one form.

Do not over-design a form library/dashboard before multiple PDF templates actually exist.

### Step 3 — Complete web form

The application displays normal HTML inputs that correspond to the fields required by the predefined PDF.

Depending on the actual document, controls may include:

- text input;
- textarea;
- date input;
- select;
- radio buttons;
- checkboxes;
- numeric input;
- phone input;
- email input.

The web form should be easier to complete than the underlying PDF.

### Step 4 — Review

Before generating the PDF, show a review screen or review state where the user can inspect the entered information.

The user should be able to:

- go back and edit;
- see validation errors;
- generate the PDF when ready.

### Step 5 — Generate PDF

When the user selects `Generate PDF`:

1. load the predefined blank PDF template from a static asset;
2. load it with `pdf-lib`;
3. insert values based on the template mapping configuration;
4. generate the completed PDF bytes in browser memory;
5. present a download action or trigger a browser download.

No form answers should be transmitted over the network during this process.

### Step 6 — Completion / clear data

After the PDF has been generated, show:

- `Download PDF`;
- `Start a new form`;
- an explicit privacy message such as `Information entered here is not saved by this application.`

When `Start a new form` is selected:

- clear all in-memory state;
- revoke any object URL created for the generated PDF;
- return to a blank form.

---

## 7. Suggested screen structure

Keep V1 to approximately four states/screens.

### Screen A — Home / form selection

Content:

- app name placeholder;
- sentence explaining the product;
- one form card;
- `Start form` button;
- small privacy statement.

### Screen B — Form entry

Content:

- form name;
- section headings matching the logical structure of the PDF;
- standard web fields;
- progress indicator if the form is long;
- `Continue` or `Review` button;
- `Clear form` control.

For long forms, implement sections instead of showing 40+ fields in one uninterrupted page.

### Screen C — Review

Content:

- readable summary of entered fields grouped by section;
- `Edit` actions;
- `Generate PDF` button.

Do not display blank optional values unnecessarily.

### Screen D — Completed

Content:

- success state;
- `Download PDF` button;
- `Start a new form` button;
- privacy reminder that data has not been saved.

---

## 8. Form definition architecture

Do not hard-code every field directly into one giant React component.

Create a configuration-driven form architecture so another predefined PDF can be added later without rewriting the application.

Suggested structure:

```text
src/
  forms/
    formTypes.ts
    templates/
      exampleForm.ts
```

Example TypeScript model:

```ts
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'email'
  | 'tel'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  pdf: PdfFieldMapping;
}

export interface FormSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
}

export interface PdfTemplateDefinition {
  id: string;
  name: string;
  templatePath: string;
  defaultDownloadName: string;
  sections: FormSectionDefinition[];
}
```

The actual implementation can vary, but maintain the same separation of concerns:

- web form definition;
- validation;
- PDF mapping;
- PDF-generation logic;
- UI components.

---

## 9. PDF field mapping

The implementation must accommodate the fact that predefined PDFs may be built differently.

### Preferred method — AcroForm fields

If the supplied PDF has fillable AcroForm fields, use their existing field names.

Example mapping:

```ts
export interface AcroTextMapping {
  mode: 'acroform';
  fieldName: string;
}
```

Generation example conceptually:

```ts
const form = pdfDoc.getForm();
form.getTextField('patient_name').setText(values.patientName);
```

Use the appropriate PDF field type for checkboxes, radio groups, dropdowns, etc.

### Fallback method — coordinate overlay

If the supplied PDF is a flat/non-fillable PDF, support drawing text/marks at configured coordinates.

Example mapping:

```ts
export interface OverlayTextMapping {
  mode: 'overlay';
  page: number;
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
  lineHeight?: number;
}
```

Then use `pdf-lib` page drawing APIs.

Support at minimum:

- text;
- multi-line text;
- checkbox/tick mark;
- simple selected option indicator.

### Unified mapping

Use a union type so each field can specify its mapping method.

```ts
export type PdfFieldMapping =
  | {
      mode: 'acroform';
      fieldName: string;
      pdfFieldType?: 'text' | 'checkbox' | 'radio' | 'dropdown';
    }
  | {
      mode: 'overlay';
      page: number;
      x: number;
      y: number;
      size?: number;
      maxWidth?: number;
      lineHeight?: number;
      renderAs?: 'text' | 'checkbox' | 'radio';
    };
```

### Mapping utility

Create a small development utility/script that helps inspect the PDF.

If AcroForm fields exist, the utility should list:

- field name;
- field type.

This can be a Node development script because it operates on the blank template, not patient data.

Suggested command:

```bash
npm run inspect-pdf -- public/templates/form.pdf
```

If no form fields exist, document that coordinate mapping must be configured manually.

Do not include patient data in this utility.

---

## 10. Behaviour when the real PDF has not yet been supplied

Codex should not block the entire application because the final production PDF is not present.

If there is no actual template in the repository:

1. build the full web application architecture;
2. include a clearly labelled demo/template configuration using fake fields;
3. include a small test fixture PDF or create one during test setup;
4. add instructions in `public/templates/README.md` describing how to add the real blank PDF;
5. make the template configuration easy to replace;
6. do not pretend the real PDF mapping has been completed.

If a PDF is already present in the repository, inspect it and implement its real mapping where practical.

---

## 11. Form state

Use ordinary React in-memory state.

A simple object is sufficient:

```ts
interface FormValues {
  [fieldId: string]: string | boolean | string[];
}
```

Do not persist the state.

Do not add Redux, Zustand persistence, React Query persistence, or similar tooling unless required by an existing codebase.

### Clear behaviour

Provide a shared function that securely clears the app's logical state:

```ts
resetForm();
revokeGeneratedPdfUrl();
```

It is not necessary or realistic for browser JavaScript to guarantee physical memory wiping. The V1 requirement is that the application does not deliberately persist or transmit the values.

---

## 12. Validation

Validation should improve PDF accuracy without creating excessive friction.

Implement:

- required fields;
- max length where the PDF has space constraints;
- dates;
- email format when applicable;
- phone format leniently;
- numeric values where required;
- dependent fields where the underlying PDF requires them.

Display errors next to fields and provide a summary when the user tries to continue.

Do not silently truncate important values. If the PDF has a strict character limit, tell the user before generation.

For overlay fields with physical width constraints, detect obvious overflow where practical and show a validation warning.

---

## 13. PDF generation service

Keep PDF generation isolated from UI code.

Suggested path:

```text
src/pdf/
  generatePdf.ts
  inspectTemplate.ts
  renderers/
    renderAcroField.ts
    renderOverlayField.ts
```

Suggested public interface:

```ts
export async function generateCompletedPdf(
  template: PdfTemplateDefinition,
  values: Record<string, unknown>
): Promise<Uint8Array>
```

The function should:

1. fetch the static blank template from the app origin;
2. load the template with `pdf-lib`;
3. process configured fields;
4. update field appearances if needed;
5. optionally flatten PDF form fields only if the output requirement calls for it;
6. save to a `Uint8Array`;
7. return the bytes to the caller.

The UI layer should convert the bytes to a Blob/Object URL for download.

### Download filename

Do not put patient names, dates of birth, Medicare numbers, or other patient data into the filename.

Use a generic filename such as:

```text
completed-form.pdf
```

or a generic form identifier plus timestamp if needed:

```text
ahtr-completed-2026-08-13.pdf
```

Avoid patient identifiers in browser history/download names.

---

## 14. Browser/network privacy requirements

The production application should be capable of completing a form without making any network request containing a form value.

### No outbound APIs

There should be no `fetch`, `XMLHttpRequest`, beacon, WebSocket, or third-party SDK request carrying form values.

The only expected network requests after authentication should be for static application assets such as:

- HTML;
- JavaScript bundle;
- CSS;
- icons;
- blank PDF templates.

### Content Security Policy

Add security headers appropriate for a static application.

For Cloudflare Pages, place a `_headers` file in the static/public output source as appropriate for Vite.

Start from a restrictive policy such as:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
```

Adjust only as required by the final build.

If the app makes no runtime API requests other than same-origin static asset requests, keep `connect-src` restrictive.

Do not weaken CSP simply to make a third-party analytics or font service work.

### External fonts/assets

Prefer system fonts or locally bundled fonts/assets. Do not rely on Google Fonts or other runtime third-party asset calls for V1.

---

## 15. Autocomplete and browser features

For fields containing health/patient information:

- set appropriate `autocomplete` attributes;
- where appropriate use `autocomplete="off"`;
- do not use URL state;
- do not implement automatic draft recovery.

Note: browsers may not always honour autocomplete hints. The application should not claim it can control all browser-level behaviour outside the app.

---

## 16. Accessibility and responsive behaviour

The application should work well on desktop and tablet first, and remain usable on mobile.

Implement:

- semantic labels for every field;
- keyboard navigation;
- visible focus states;
- accessible error messages;
- adequate tap targets;
- logical heading structure;
- screen-reader-friendly field groups;
- no information conveyed by colour alone.

Do not spend V1 effort on advanced animations.

---

## 17. Design direction

Use a clean, calm clinical interface.

Design characteristics:

- light background;
- strong readability;
- generous spacing;
- restrained use of colour;
- obvious primary actions;
- clear section grouping;
- minimal visual noise.

The purpose is to make a tedious administrative task feel quicker and simpler.

Do not mimic the PDF visually. The web form should be designed for usability; the PDF remains the output format.

### Desktop layout suggestion

- max content width around 760–900px;
- sticky or visible section/progress indicator if useful;
- fields arranged in one column by default;
- two-column layout only for naturally paired short fields.

---

## 18. Privacy messaging in the UI

Use short, factual privacy copy.

Suggested message near the form start:

> Information entered into this form is processed in your browser to create the PDF. This prototype does not save the information you enter or the completed PDF.

Suggested message on completion:

> Your completed PDF was generated in this browser. This application has not saved the form information or the generated PDF.

Do not make broad legal/compliance claims such as:

- `HIPAA compliant`;
- `Privacy Act compliant`;
- `100% secure`;
- `government approved`;
- `medical-grade security`.

Those claims are outside the scope of the engineering implementation.

---

## 19. Access-control setup

The application itself should remain a static site. Cloudflare Access should protect it externally.

Create a `DEPLOYMENT.md` with instructions for a human administrator.

### Cloudflare Pages

Document:

1. create/import the project;
2. connect the Git repository or use a supported deployment flow;
3. use the Vite build command;
4. publish the Vite output directory;
5. add a custom domain/subdomain if desired;
6. verify HTTPS;
7. verify `_headers` are applied.

Typical build values:

```text
Build command: npm run build
Output directory: dist
```

### Cloudflare Access

Document the admin flow conceptually:

1. create a Cloudflare Zero Trust organisation if necessary;
2. add the Pages/custom-domain application to Access;
3. configure an Allow policy;
4. permit only specifically approved email addresses or an approved group/domain as appropriate;
5. configure OTP or the selected identity provider;
6. verify an unapproved email cannot reach the application;
7. verify an approved user can authenticate;
8. document how to revoke a user.

### Important Access-policy warning

Do not configure one-time PIN access in a way that allows any arbitrary email address.

The policy must explicitly restrict who is permitted.

For the initial prototype, prefer individual approved emails rather than a broad public rule.

---

## 20. No application user database

Do not create an internal `users` table for V1.

The allowed-user list can be managed at the Cloudflare Access level.

This means the V1 application does not need:

- signup;
- password reset;
- password storage;
- email verification logic;
- session database;
- user profile page;
- role management.

If product requirements later require organisation administration, an application user store can be introduced separately from patient data.

---

## 21. Repository structure

A reasonable target structure is:

```text
/
├── public/
│   ├── _headers
│   └── templates/
│       ├── README.md
│       └── example-form.pdf        # or actual supplied template
│
├── scripts/
│   └── inspect-pdf-fields.ts
│
├── src/
│   ├── components/
│   │   ├── FormField.tsx
│   │   ├── FormSection.tsx
│   │   ├── PrivacyNotice.tsx
│   │   └── ...
│   │
│   ├── forms/
│   │   ├── formTypes.ts
│   │   ├── formRegistry.ts
│   │   └── templates/
│   │       └── exampleForm.ts
│   │
│   ├── pdf/
│   │   ├── generatePdf.ts
│   │   └── ...
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── FormScreen.tsx
│   │   ├── ReviewScreen.tsx
│   │   └── CompleteScreen.tsx
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   └── download.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── pdf/
│   └── e2e/
│
├── DEPLOYMENT.md
├── PRIVACY-ARCHITECTURE.md
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

This is guidance rather than a mandatory exact tree. Preserve a clean separation between form configuration, UI, and PDF rendering.

---

## 22. README requirements

The repository README should explain:

### What the product does

A short description of the workflow.

### V1 privacy architecture

Explicitly state:

- patient form values stay in browser memory;
- patient values are not sent to an application backend;
- there is no patient database;
- generated PDFs are not uploaded by the application;
- there is no AI integration;
- access control is handled outside the app by Cloudflare Access.

### Local development

For example:

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test
npm run test:e2e
```

### Adding/replacing a PDF template

Explain the template file and mapping process.

---

## 23. Privacy architecture document

Create `PRIVACY-ARCHITECTURE.md` as a technical description, not a legal policy.

It should document:

### Data that enters the application

- form answers typed by the clinician.

### Where that data lives

- React/browser memory for the active session;
- temporary PDF bytes/Blob in browser memory after generation.

### Where it does not go

- no application database;
- no application API;
- no server PDF processor;
- no analytics service;
- no AI provider;
- no file-storage service.

### Persistent non-patient data

Cloudflare or the configured identity provider may retain access/authentication-related information such as approved identity and access events. This is separate from the form content itself.

Do not state that absolutely no data of any kind is stored anywhere, because access infrastructure has its own authentication/logging behaviour.

---

## 24. Testing requirements

### Unit tests

Test at minimum:

- required-field validation;
- field mapping logic;
- date formatting;
- checkbox/radio transformations;
- generic output filename generation;
- reset/clear state behaviour.

### PDF tests

Create automated tests that:

1. load a known blank test PDF;
2. insert fake/test values;
3. save the PDF;
4. reload it where possible;
5. assert values/fields were populated correctly.

Use obviously synthetic data such as:

```text
Test Patient
01/01/1990
0000000000
Example Street
```

Never put real patient information into repository fixtures.

### End-to-end tests

Test the main flow:

```text
open app
-> choose form
-> fill fields
-> review
-> generate PDF
-> download is initiated
-> start new form
-> inputs are blank
```

Also test:

- required fields block generation;
- user can return from review to edit;
- no state is restored after page refresh.

### Network privacy test

Add a Playwright test or equivalent that records network requests while entering distinctive fake form values.

Verify that the distinctive values do not appear in:

- request URLs;
- request bodies;
- request headers controlled by the app.

This is an important regression test.

---

## 25. Security-oriented code review checklist

Before considering V1 complete, inspect the source for:

- `localStorage`;
- `sessionStorage`;
- IndexedDB usage;
- analytics packages;
- telemetry packages;
- external form submission;
- unexpected `fetch` calls;
- `console.log(values)`;
- patient values in filenames;
- patient values in URLs;
- serverless functions;
- API routes;
- generated PDF uploads;
- third-party scripts.

If any are found, confirm why they exist and remove anything inconsistent with this specification.

---

## 26. Error handling

Errors should be useful without exposing patient values.

Good:

```text
Unable to generate the PDF. Please check the form and try again.
```

Avoid:

```text
Failed while writing value "Jane Smith" to patient_name.
```

Production exceptions should reference field IDs or technical identifiers only where needed, not values.

Example:

```text
PDF_MAPPING_ERROR: fieldId=patientName
```

Do not send exceptions to an external error-reporting service in V1.

---

## 27. Handling unsupported PDF fields

If a mapped PDF field cannot be found or rendered:

- fail gracefully;
- identify the configured field ID, not its value;
- prevent generation of a misleading/incomplete PDF unless explicitly safe to continue;
- show a generic user-facing error;
- provide a development-mode error that identifies the missing mapping.

At startup/development time, it is useful to validate that all configured AcroForm field names exist in the supplied PDF.

---

## 28. Performance expectations

At approximately 200 forms/month, optimisation for high concurrency is unnecessary.

Target:

- application loads quickly on ordinary clinic internet;
- PDF template is loaded efficiently;
- normal multi-page PDF generation completes in a few seconds or less on a typical recent desktop/laptop;
- no server scaling logic is required.

Do not introduce backend infrastructure for perceived performance unless browser-side PDF generation proves inadequate with the actual PDF.

---

## 29. V1 operating-cost target

The architecture should be compatible with a very low or effectively zero monthly infrastructure cost at prototype usage levels.

Expected components:

```text
Static hosting       -> Cloudflare Pages
Access gate          -> Cloudflare Access
PDF processing       -> user's browser
Database             -> none
Patient file storage -> none
Backend API          -> none
AI API               -> none
```

Do not implement paid infrastructure merely because it might be needed at enterprise scale later.

---

## 30. Non-goals for V1

Explicitly do not build the following unless separately requested:

- AI autofill;
- OCR;
- voice dictation;
- Cliniko integration;
- Nookal integration;
- Halaxy integration;
- practice-management integrations;
- patient search;
- patient profiles;
- saved drafts;
- completed-form history;
- cloud PDF storage;
- email completed PDF;
- e-signature workflow;
- payments;
- subscriptions;
- team administration;
- clinic dashboard;
- analytics dashboard;
- audit trail of patient-form actions;
- multi-tenant patient data;
- database encryption strategy;
- mobile native apps.

These are future product decisions, not V1 prerequisites.

---

## 31. Future-safe design decisions

Although V1 is intentionally small, structure the code so these can be introduced later without rebuilding everything.

### Multiple PDF templates

Use a template registry/configuration model.

### Clinic-specific defaults

Keep field definitions distinct from field values so defaults can later be introduced.

### AI assistance

Keep PDF generation independent from data-entry UI so an AI-assisted input layer could later populate the same form state after a separate privacy/security design review.

### Integrations

Keep a stable internal form-value schema so a practice-management integration could later map data into it.

Do not build these features now.

---

## 32. Acceptance criteria

V1 is complete when all of the following are true.

### Access

- [ ] Deployed application is not publicly accessible without the configured Cloudflare Access authentication.
- [ ] An approved user can authenticate and open it.
- [ ] An unapproved user cannot access it.
- [ ] There is documentation for adding/removing approved users.

### Form UX

- [ ] User can start the predefined form.
- [ ] User can complete all mapped fields through standard web controls.
- [ ] Required fields are validated.
- [ ] User can review values before generation.
- [ ] User can return and edit values.

### PDF

- [ ] Blank PDF template is loaded locally from the static application assets.
- [ ] User-entered values are inserted correctly.
- [ ] Checkbox/radio/select behaviour matches the PDF where applicable.
- [ ] Completed PDF can be downloaded.
- [ ] Download filename does not contain patient information.
- [ ] PDF generation does not require an API call.

### Privacy/data flow

- [ ] No patient database exists.
- [ ] No application backend receives patient values.
- [ ] No patient form data is written to browser persistent storage.
- [ ] No completed PDF is uploaded.
- [ ] No analytics/session replay tool is installed.
- [ ] No AI service receives form data.
- [ ] No patient data appears in URL parameters.
- [ ] Production logging does not log form values.
- [ ] Refreshing the page clears the form.
- [ ] `Start a new form` clears in-memory state and generated PDF object URLs.
- [ ] Network regression test confirms fake form values are not transmitted by the app.

### Engineering

- [ ] TypeScript build passes.
- [ ] Lint/checks pass.
- [ ] Unit tests pass.
- [ ] End-to-end happy path passes.
- [ ] README is complete.
- [ ] `DEPLOYMENT.md` is complete.
- [ ] `PRIVACY-ARCHITECTURE.md` is complete.
- [ ] Real PDF mapping is completed if the real PDF was supplied; otherwise the missing mapping is explicitly documented.

---

## 33. Recommended implementation sequence for Codex

Implement in this order.

### Phase 1 — Repository setup

1. Inspect the existing repository.
2. Preserve useful existing configuration.
3. Establish React + TypeScript + Vite if no frontend exists.
4. Install `pdf-lib` and minimal test dependencies.
5. Add lint/typecheck/test commands.

### Phase 2 — Form model

1. Define form/template TypeScript types.
2. Create a template registry.
3. Create one V1 form configuration.
4. Implement validation.

### Phase 3 — UI

1. Build home/form-selection state.
2. Build form-entry state.
3. Build review state.
4. Build completion/download state.
5. Implement reset/clear behaviour.

### Phase 4 — PDF integration

1. Inspect supplied PDF if present.
2. Detect/list AcroForm field names if applicable.
3. Implement mapping.
4. Add coordinate-overlay fallback architecture.
5. Implement generation/download.
6. Add PDF tests.

### Phase 5 — Privacy/security hardening

1. Remove all value logging.
2. confirm no persistent client storage.
3. confirm no API/backend routes.
4. add `_headers` security headers.
5. add network privacy regression test.
6. inspect bundle for unnecessary third-party telemetry.

### Phase 6 — Deployment docs

1. Write Cloudflare Pages deployment steps.
2. Write Cloudflare Access allow-list setup steps.
3. Document approved-user revocation.
4. Document how to verify Access is actually protecting the deployed hostname.

### Phase 7 — Final verification

1. Run build.
2. Run tests.
3. Run end-to-end flow.
4. inspect browser network requests.
5. inspect browser storage in DevTools.
6. compare generated PDF visually against the blank template and expected output.
7. provide a concise final implementation summary and identify any remaining item requiring the real PDF or Cloudflare account access.

---

## 34. Instructions to Codex

Treat this specification as the source of truth for V1.

When implementing:

1. **Prefer the simplest solution that satisfies the acceptance criteria.**
2. **Do not introduce a backend or database.**
3. **Do not transmit user-entered form data from the browser.**
4. **Do not add AI.**
5. **Do not add analytics or session replay.**
6. **Do not persist patient/form values in browser storage.**
7. **Keep the PDF mapping configuration-driven.**
8. **Use fake data only in tests and development fixtures.**
9. **Do not place patient values in logs, errors, URLs, or filenames.**
10. **Keep the deployment static and protect the deployed site using Cloudflare Access.**

If an existing repository contains code that conflicts with these requirements, refactor or disable the conflicting behaviour for V1 rather than preserving it by default.

If a decision is ambiguous, favour:

```text
less data collection
less persistence
fewer dependencies
less infrastructure
more client-side processing
more explicit user control
```

If the real PDF template is available, prioritise making the actual end-to-end form-to-PDF workflow work correctly over adding additional generic product features.

---

## 35. Definition of the V1 product in one sentence

> **An invite-only static web app that converts clinician-entered web-form data into a predefined completed PDF entirely in the browser, without storing or transmitting patient form data.**
