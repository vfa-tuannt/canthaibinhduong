# Research: Inventory Management System

**Feature**: 001-inventory-management  
**Date**: 2026-04-15  
**Purpose**: Resolve unknowns, validate technology choices, and document best practices.

## R1: GAS HTML Service — SPA vs Multi-Page

**Decision**: Single HTML file with client-side view switching (SPA-like pattern)

**Rationale**:
- GAS `HtmlService.createTemplateFromFile()` serves HTML as a single page. There is no URL routing.
- Multi-page requires multiple `doGet` dispatches which adds latency (each is a full server round-trip).
- A single-page approach with `google.script.run` for async server calls provides the best UX in GAS.
- CSS and JS are embedded via `<?!= include('css') ?>` / `<?!= include('js') ?>` pattern (GAS templating).

**Alternatives considered**:
- Multiple HTML pages dispatched via query parameters in `doGet` — rejected due to full page reload on each navigation and added complexity.
- External frontend hosted outside GAS — rejected; violates simplicity principle and adds infrastructure cost.

## R2: Google Sheets as Database — Schema Design

**Decision**: One sheet per logical table with row 1 as headers. Use `SpreadsheetApp.openById(SPREADSHEET_ID)` for table access (standalone script reading ID from ScriptProperties).

**Rationale**:
- Google Sheets natively supports tabular data with named sheets.
- Row 1 headers make the schema self-documenting and human-readable without code.
- `getDataRange().getValues()` returns a 2D array that maps directly to typed arrays in TypeScript.
- For writes, `appendRow()` for inserts and `getRange().setValues()` for updates.

**Alternatives considered**:
- Storing data as JSON in `PropertiesService` — rejected; 9KB per property limit, no query capability, not human-readable.
- Firebase Realtime Database — rejected; adds external dependency, quota concerns, and violates YAGNI.

**Best practices**:
- Always batch reads: fetch entire sheet at once with `getDataRange().getValues()`, filter in memory.
- Minimize `SpreadsheetApp` calls — each call is ~0.5-1s. Batch writes with `setValues()` on a range.
- Use `SpreadsheetApp.flush()` after critical writes to ensure persistence.

## R3: Authentication in GAS Web App

**Decision**: Simple username/password check against `ScriptProperties`, with session token stored in `PropertiesService.getScriptProperties()` with 7-day TTL.

**Rationale**:
- Only 1 user (tienha). Full OAuth/SSO is overkill per YAGNI principle.
- `PropertiesService.getScriptProperties()` stores credentials server-side, never exposed to client.
- `PropertiesService.getScriptProperties()` stores session tokens server-side with JSON-encoded expiry timestamps — supports TTL up to any duration (7 days configured).
- Client-side `localStorage` persists the token across page reloads, enabling seamless session restoration.
- On each server call, validate the session token before processing.

**Alternatives considered**:
- Google Sign-In (OAuth2) — rejected; single user doesn't justify the complexity, and GAS web apps deployed as "Execute as me, accessible by anyone" already have Google SSO at the container level.
- No authentication — rejected; spec requires it explicitly.
- Cookie-based sessions — rejected; GAS HTML Service runs in a sandboxed iframe, cookies are unreliable.

**Security notes**:
- Session token = UUID generated server-side, stored in `ScriptProperties` with 7-day expiry timestamp.
- Client stores token in `localStorage` for session persistence across page reloads.
- Password comparison uses constant-time approach to prevent timing attacks (though threat model is minimal for 1 user).
- Per constitution Principle VI, credentials stored in `ScriptProperties` — set once via `PropertiesService.getScriptProperties().setProperty()` during initial deployment.

## R4: Stock Adjustment Atomicity

**Decision**: Use `LockService.getScriptLock()` to serialize stock adjustments and prevent race conditions.

**Rationale**:
- Even though single-user, browser multi-tab or rapid clicks could cause concurrent GAS executions.
- `LockService` provides mutual exclusion for 6 minutes (matching GAS execution limit).
- Pattern: acquire lock → read current qty → validate → write new qty + history row → release lock.

**Alternatives considered**:
- No locking (assume single user, single tab) — rejected; constitution says "best practice" not "least effort".
- Sheet-level protection — not applicable; this is about concurrent script execution, not user edits.

## R5: Dashboard Aggregation Strategy

**Decision**: Compute monthly aggregates on-the-fly by reading the AdjustmentHistory sheet and grouping by month/variant.

**Rationale**:
- With ~2000 variants and a few thousand history rows, full-sheet read + in-memory aggregation completes in <3 seconds.
- Avoids maintaining a separate summary sheet that could drift out of sync.
- GAS `Utilities.formatDate()` for month extraction from timestamps.

**Alternatives considered**:
- Pre-computed summary sheet updated on each adjustment — rejected; adds write overhead on every transaction and introduces sync risk.
- Google Sheets built-in pivot tables — rejected; not programmatically queryable from GAS in a way that integrates with the HTML UI.

## R6: HTML/CSS Framework for GAS UI

**Decision**: Vanilla HTML/CSS/JS with a simple component pattern. No external CSS framework.

**Rationale**:
- GAS HTML Service bundles all assets inline. External CDN links are unreliable (CSP restrictions in iframe sandbox).
- The UI has only 4 screens — a CSS framework adds unnecessary weight.
- `google.script.run.withSuccessHandler().withFailureHandler()` is the standard async pattern for client→server calls.
- Keep CSS in a single `css.html` file, JS in a single `js.html` file, following GAS conventions.

**Alternatives considered**:
- Bootstrap via CDN — partially works in GAS but adds 200KB+ of CSS/JS for 4 simple screens.
- React/Vue bundled — rejected; adds Webpack complexity and violates YAGNI for 4 screens.

## Consolidated Decisions

| Topic | Decision | Key Constraint |
|-------|----------|---------------|
| UI Architecture | SPA-like single HTML with view switching | GAS has no URL routing |
| Database | Google Sheets (1 sheet = 1 table) | Batch reads, minimize API calls |
| Auth | ScriptProperties + PropertiesService session | Single user, 7-day session TTL |
| Concurrency | LockService for stock adjustments | Prevent multi-tab race conditions |
| Dashboard | On-the-fly aggregation from history | <3s for ~2000 variants |
| Frontend | Vanilla HTML/CSS/JS | GAS iframe sandbox, keep simple |
