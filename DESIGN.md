---
name: "Allied Health PDF Filler"
description: "Local browser-only PDF filling workbench for allied health forms."
colors:
  surface: "#f6f8f7"
  surface-raised: "#ffffff"
  surface-muted: "#e9efed"
  ink: "#16211f"
  ink-muted: "#52615d"
  line: "#cfd8d4"
  accent: "#0f766e"
  accent-strong: "#0a514d"
  accent-soft: "#d7efea"
  accent-border: "#bed8d2"
  accent-ink: "#123c39"
  icon-wash: "#e0ebe8"
  preview-wash: "#dde6e3"
  safety: "#a33b2d"
  safety-soft: "#f7ded9"
  safety-border: "#dda69a"
  safety-ink: "#6f2319"
  focus: "#b85b2e"
  input-border: "#aebcb8"
  hover-border: "#99aaa5"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "4.2rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2.8rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "0"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 700
    letterSpacing: "0"
  intro:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.62
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.28rem"
    fontWeight: 700
    lineHeight: 1.2
  card-title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
  small:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 700
  support:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
  micro:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
  display-tablet:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "3.2rem"
    fontWeight: 800
    lineHeight: 1
  headline-tablet:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 800
    lineHeight: 1.08
  headline-mobile:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.08
rounded:
  sm: "7px"
  md: "8px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: Allied Health PDF Filler

## Overview

**Creative North Star: "Clinical Intake Workbench"**

The interface is a quiet operational tool for clinicians completing administrative form work. It should feel like a clean workstation: clear surfaces, readable labels, obvious actions, and privacy reminders that support the workflow without becoming marketing.

The system uses a restrained palette, compact rails, form rows, thin dividers, and visible states. It avoids decorative clinical tropes and keeps the PDF as output context, not as the structure of the web form.

**Key Characteristics:**
- Pale workstation surfaces with ink text and measured teal action color.
- Dense but comfortable form sections, each with clear headings and support text.
- Browser-only privacy messages visible at start, entry, and completion.
- A real preview image for the active PDF template.

## Colors

The palette is neutral and clinical with teal for primary action and red-brown only for safety or replacement warnings.

### Primary
- **Workbench Teal** (#0f766e): Primary actions and active navigation.
- **Deep Teal** (#0a514d): Hover states, compact labels, and high-emphasis local status text.
- **Soft Teal Wash** (#d7efea): Privacy notices and active section backgrounds.
- **Teal Border** (#bed8d2): Privacy notice border.
- **Teal Ink** (#123c39): Privacy notice text.
- **Icon Wash** (#e0ebe8): Form-card icon background.
- **Preview Wash** (#dde6e3): PDF preview background.

### Tertiary
- **Safety Red-Brown** (#a33b2d): Validation errors and demo-template warnings.
- **Soft Safety Wash** (#f7ded9): Error summary and invalid field glow.
- **Safety Border** (#dda69a): Error summary border.
- **Safety Ink** (#6f2319): Error summary text.
- **Focus Copper** (#b85b2e): Keyboard focus outline.

### Neutral
- **Pale Workstation** (#f6f8f7): Page background.
- **Raised Paper** (#ffffff): Cards, panels, form sections, and controls.
- **Muted Work Surface** (#e9efed): Template-preview grounding.
- **Clinical Ink** (#16211f): Primary text.
- **Muted Ink** (#52615d): Supporting copy and field help.
- **Divider Line** (#cfd8d4): Borders, separators, and input structure.
- **Input Border** (#aebcb8): Input and textarea default border.
- **Hover Border** (#99aaa5): Ghost-button hover border.

### Named Rules

**The Privacy Blue-Green Rule.** Use teal washes for privacy assurance and active workflow state. Do not use the safety color for privacy copy.

**The Safety Rarity Rule.** Red-brown appears only when something needs attention: validation errors, warnings, and fixture replacement notices.

## Typography

**Display Font:** system UI sans stack.
**Body Font:** system UI sans stack.

**Character:** The type is practical and high legibility. Headings are heavy enough for fast scanning; body copy stays plain and compact.

### Hierarchy
- **Display** (800, 4.2rem desktop, 3.2rem tablet, 2rem mobile, 1 line-height): Product title on Home.
- **Headline** (800, 2.8rem desktop, 2.4rem tablet, 2rem mobile, 1.08 line-height): Workspace and completion titles.
- **Title** (700, 1.28rem, 1.2 line-height): Form and review section headings.
- **Body** (400, 1rem, 1.5 line-height): Form support copy, notices, and review values.
- **Intro** (400, 1.08rem, 1.62 line-height): Home and completion lead copy.
- **Small** (700, 0.92rem): Demo or safety note style.
- **Support** (400, 0.9rem): Field help text.
- **Micro** (700, 0.75rem): Compact rail status.
- **Label** (700, 0.86-1rem, 0 letter spacing): Field labels, local status, active rails, and buttons.

### Named Rules

**The No Ornamental Type Rule.** Do not add decorative fonts, uppercase tracking, or faux-medical monospace. This is a working clinical tool.

## Layout

The main content is constrained to 1120px with 32px desktop gutters and 20px mobile gutters. Home uses two stacked bands: an intro/privacy band and an available-form/template-preview band. Form entry uses a two-column workbench at desktop, with a 220px sticky section rail and a flexible form column. Below 860px the rail stacks above the form, and below 620px all controls become single-column.

Spacing uses tight field groups and generous section separation: 8-12px inside controls, 18-24px between form groups, and 32px around major bands.

## Elevation & Depth

Depth is structural, not decorative. Major panels use a single soft shadow (`0 18px 38px rgba(21, 35, 31, 0.12)`) plus a thin divider. Controls and nested form rows rely on borders and tonal layering rather than extra shadows.

### Shadow Vocabulary
- **Workbench Panel Shadow** (`0 18px 38px rgba(21, 35, 31, 0.12)`): Home bands, workspace header, and completion panel.
- **Primary Action Shadow** (`0 10px 24px rgba(15, 118, 110, 0.22)`): Primary buttons only.

## Shapes

Corners are compact and consistent: 8px for panels/cards/notices, 7px for buttons, inputs, choices, and active rail items. Avoid pills except for tiny status indicators that include an icon and short label.

## Components

### Buttons
- **Shape:** Compact rectangle with 7px radius and at least 44px height.
- **Primary:** Teal fill, white text, lucide icon, soft action shadow.
- **Hover / Focus:** Hover deepens to Deep Teal. Focus uses a 3px Focus Copper outline.
- **Ghost:** White background, Divider Line border, ink text, lucide icon.

### Cards / Containers
- **Corner Style:** 8px radius.
- **Background:** Raised Paper over Pale Workstation.
- **Shadow Strategy:** Only major panels receive the workbench shadow.
- **Border:** 1px Divider Line.
- **Internal Padding:** 18px mobile, 24-34px desktop depending on surface weight.

### Inputs / Fields
- **Style:** White fill, 1px muted border, 7px radius, 11px/12px padding.
- **Focus:** Copper outline with 2px offset.
- **Error:** Safety border plus Soft Safety Wash outer ring and field-level recovery text.
- **Choice Rows:** Radio and checkbox options are full-width bordered rows with 44px minimum height.

### Navigation
- **Section Rail:** Sticky at desktop, stacked at tablet/mobile. Active items use Soft Teal Wash and Deep Teal text. Sections with validation errors show Safety text.

### Template Preview

Use a generated PNG preview from the static PDF. Do not rely on the browser PDF plugin for the preview area because it may fall back to an empty frame.

## Do's and Don'ts

### Do:
- **Do** keep all patient/form work inside browser memory and make that visible in short privacy notices.
- **Do** use teal only for state, confidence, and primary progression.
- **Do** make form sections scannable with headings, help text, and one-column fields by default.
- **Do** keep generated PDF assets visually secondary to the web form.

### Don't:
- **Don't** introduce Cloudflare-hosted UI, backend routes, analytics, AI, or patient-data storage into this local v0.
- **Don't** use patient identifiers in filenames, URLs, logs, or visible browser state.
- **Don't** add nested cards, oversized marketing heroes, decorative illustrations, or ornamental clinical imagery.
- **Don't** use red-brown for ordinary emphasis; it is reserved for errors and safety warnings.
