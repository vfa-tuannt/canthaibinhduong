# Implementation Plan: Inventory Management System

**Branch**: `001-inventory-management` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-inventory-management/spec.md`

## Summary

Build a web-based inventory (tồn kho) management system for weighing-scale products using Google Apps Script + Google Sheets. The system provides authentication, product/variant CRUD, stock adjustment with full audit history, and a monthly dashboard — all served via GAS HTML Service with Sheets as the database backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @types/google-apps-script, gas-webpack-plugin, @google/clasp v2.x
**Storage**: Google Sheets (one sheet per logical table: Products, Variants, AdjustmentHistory)
**Testing**: Manual integration tests in GAS runtime (no unit test framework per constitution)
**Target Platform**: Google Apps Script V8 runtime, served via HTML Service (web app)
**Project Type**: web-app (GAS Web App deployed via `doGet`)
**Performance Goals**: All operations < 5 seconds; full page load < 10 seconds
**Constraints**: 6-min GAS execution limit; synchronous only (no async/await); single-file Webpack bundle; ~500 products / ~2000 variants max
**Scale/Scope**: 1 user, ~100 current products (from CSV), 4 main screens (login, products, adjustment, dashboard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | TypeScript-First (NON-NEGOTIABLE) | ✅ PASS | All code in `src/`, strict mode enabled, no `any` planned |
| II | Single Entry Point | ✅ PASS | `doGet` serves HTML; all GAS-callable functions exported from `src/index.ts` |
| III | Bundled Deployment (NON-NEGOTIABLE) | ✅ PASS | Standard pipeline: `tsc → webpack → Code.js → clasp push` |
| IV | GAS Runtime Compliance | ✅ PASS | No async/await; using SpreadsheetApp, HtmlService, CacheService, PropertiesService only |
| V | Observability | ✅ PASS | `console.log`/`console.error` on all CRUD, auth, and adjustment paths; Stackdriver enabled |
| VI | Credential & Secret Safety | ⚠️ ATTENTION | Username/password stored in `PropertiesService.getScriptProperties()`, NOT in source code |
| VII | Simplicity (YAGNI) | ✅ PASS | Flat module structure; no unnecessary abstractions; inline where possible |

**Gate Result**: ✅ ALL GATES PASSED

**Note on Principle VI**: The spec mentions hardcoded credentials (tienha/hatien). Per constitution, these MUST be stored in `ScriptProperties` at deployment time, NOT in TypeScript source files. The code will read from `PropertiesService.getScriptProperties().getProperty('AUTH_USERNAME')` and `AUTH_PASSWORD`.

## Project Structure

### Documentation (this feature)

```text
specs/001-inventory-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (GAS server ↔ HTML client contract)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts             # Entry point: doGet, onOpen, all GAS-callable exports
├── auth.ts              # Authentication logic (PropertiesService-backed)
├── products.ts          # Product & Variant CRUD operations (SpreadsheetApp)
├── inventory.ts         # Stock adjustment logic + history recording
├── dashboard.ts         # Monthly aggregation queries
├── sheets.ts            # Google Sheets data-access helpers (read/write/find)
└── html/
    ├── index.html       # Main SPA shell (login + app container)
    ├── css.html         # Embedded CSS (GAS HTML Service inlined)
    └── js.html          # Client-side JavaScript (GAS google.script.run calls)
```

**Structure Decision**: Single project / flat module structure. GAS bundles everything into one `Code.js` — no need for nested module hierarchy. HTML files are served via `HtmlService.createTemplateFromFile()`. No separate frontend/backend split since GAS HTML Service is the only deployment target.

## Complexity Tracking

> No constitution violations. No complexity justification needed.
