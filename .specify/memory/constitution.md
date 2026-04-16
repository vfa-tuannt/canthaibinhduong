<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump type: MINOR — new principle added (VIII. Responsive UI / Mobile-First).

Modified principles:
  None

Added principles:
  + VIII. Responsive UI (Mobile-First)

Added sections:
  None

Removed sections:
  None

Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file (overwritten)
  ✅ .specify/templates/plan-template.md — Constitution Check: verify UI tasks include
     responsive/mobile-first validation step
  ✅ .specify/templates/spec-template.md — UI features MUST declare breakpoint support
  ✅ .specify/templates/tasks-template.md — UI tasks MUST include responsive testing subtask

Deferred TODOs:
  None — all placeholders resolved.
-->

# Can Thai Binh Duong AutoSendCV GAS Constitution

## Core Principles

### I. TypeScript-First (NON-NEGOTIABLE)

All source code MUST be written in TypeScript under the `src/` directory. Direct edits to generated JavaScript
(`Code.js`, `build/`) are strictly prohibited — these files are build artifacts and will be overwritten on the
next build.

- TypeScript `strict` mode MUST be enabled at all times (`tsconfig.json`).
- `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` MUST remain `true`.
- Use of the `any` type is prohibited unless accompanied by an inline justification comment and approved
  during code review.
- All new modules MUST have explicit return types on exported functions.

**Rationale**: Strict typing catches class-level bugs at compile time and is especially critical in GAS where
runtime errors are difficult to reproduce locally.

### II. Single Entry Point

All functions callable by Google Apps Script (triggers, menus, deployments) MUST be exported from
`src/index.ts` and only from there.

- A function that is not re-exported through `src/index.ts` is invisible to GAS and MUST NOT be assumed to be
  callable.
- Side-effect-free helper modules MUST be kept in separate files under `src/` and imported into `index.ts` (or
  into modules that `index.ts` imports).
- The five Simple Trigger names (`onOpen`, `onEdit`, `onInstall`, `doGet`, `doPost`) are reserved; they MUST
  NOT be repurposed for other logic.

**Rationale**: Webpack bundles all files into a single `Code.js`. The GAS runtime only executes functions in
the global scope of that file. The only reliable way to control the public surface is through explicit exports
at `index.ts`.

### III. Bundled Deployment (NON-NEGOTIABLE)

Every deployment to Google Apps Script MUST go through the full build pipeline:

```
tsc  →  webpack  →  Code.js  →  clasp push
```

Equivalent npm scripts: `npm run build`, `npm run push`, `npm run deploy`.

- No files may be manually edited in the GAS web editor and then pulled back as the canonical source of truth.
  The `src/` directory is always the source of truth.
- All runtime dependencies MUST be resolvable at build time and bundled by Webpack. There is no `npm install`
  step in the GAS runtime environment.
- `npm run push` MUST succeed (exit 0) before a PR is merged to `main`.

**Rationale**: GAS does not support module systems or package installation. Webpack produces a single
self-contained file that is safe to deploy to the GAS V8 runtime.

### IV. GAS Runtime Compliance

Code MUST be compatible with the Google Apps Script V8 runtime and its execution model.

- `async/await` and `Promise` MUST NOT be used. GAS executes synchronously.
- Node.js built-in modules (`fs`, `path`, `http`, etc.) MUST NOT be imported. Use GAS global services
  (`UrlFetchApp`, `SpreadsheetApp`, `GmailApp`, etc.) instead.
- All HTTP / external requests MUST use `UrlFetchApp`; direct `fetch()` calls are not supported in GAS.
- GAS execution limits apply: individual executions MUST complete within 6 minutes (consumer account).
  Long-running tasks MUST be split using time-based triggers and state persistence via `PropertiesService` or
  a Sheet.
- The GAS-specific ESLint plugin (`eslint-plugin-googleappsscript`) MUST remain enabled to flag invalid global
  references at lint time.

**Rationale**: Violations of GAS platform constraints cause silent runtime failures or quota errors that are
impossible to debug locally.

### V. Observability

All non-trivial operations and every failure path MUST produce a log entry.

- Use `console.log` / `console.error` for structured output — these integrate directly with Stackdriver (Cloud
  Logging) as configured in `appsscript.json`.
- `exceptionLogging: "STACKDRIVER"` MUST remain set in `appsscript.json`.
- Caught exceptions MUST be logged with `console.error(err)` before suppression or re-throw. Silent `catch`
  blocks that discard errors are prohibited.
- Critical automation paths (e.g., email detection, CV attachment, send confirmation) MUST log start,
  completion, and any skip/error conditions.

**Rationale**: GAS runs server-side without an interactive debugger. Stackdriver logging is the primary (and
often only) post-execution diagnostic tool.

### VI. Credential & Secret Safety

Secrets, API keys, OAuth tokens, and personally identifiable information (PII) MUST NOT be hard-coded in
source files or committed to the repository.

- All sensitive configuration values MUST be stored in `PropertiesService` (`ScriptProperties` for shared
  secrets, `UserProperties` for per-user tokens).
- The `.clasp.json` Script ID is not a secret and may be committed; OAuth tokens generated by `clasp login`
  live outside the repo and MUST NOT be committed.
- `.gitignore` MUST exclude `.clasprc.json` and any local credential files.
- CV files, personal email addresses, and recruiter contact data handled by the automation MUST NOT be stored
  in source code — use Google Drive / Sheets as the data source.

**Rationale**: This project handles personal data (CV, emails, contacts). A credential leak via a public repo
would constitute a privacy and security incident.

### VII. Simplicity (YAGNI)

Implement only what is required for the current feature. Prefer the simplest working solution.

- Before adding a new abstraction, module, or utility, justify why inline code is insufficient.
- Do not design for hypothetical future requirements that have not been specified.
- Premature optimization is prohibited; measure first if performance is suspect.
- Keep functions short and single-purpose; functions exceeding ~50 logical lines SHOULD be reviewed for
  decomposition.

**Rationale**: GAS projects have a limited execution window and a small team surface. Unnecessary complexity
increases maintenance cost with no runtime benefit.

### VIII. Responsive UI (Mobile-First)

All user-facing UI (HTML pages served via `doGet`, sidebar panels, or modals) MUST be fully responsive across
mobile, tablet, and desktop viewports.

- Development MUST follow a **mobile-first** approach: base CSS targets small screens (≤ 480 px) first;
  larger breakpoints are layered on top using `min-width` media queries.
- Standard breakpoints MUST be respected:
  - Mobile: default (no media query) — ≤ 480 px
  - Tablet: `@media (min-width: 481px)` — up to 1024 px
  - Desktop: `@media (min-width: 1025px)` — 1025 px and above
- `<meta name="viewport" content="width=device-width, initial-scale=1">` MUST be present in every HTML page.
- Layout MUST NOT rely on fixed pixel widths for page-level containers; use relative units (`%`, `rem`, `vw`)
  or CSS Grid / Flexbox.
- Tap targets MUST be at least 44 × 44 px on mobile (WCAG 2.5.5 guideline).
- Horizontal scrollbars on any supported device width are prohibited.
- UI PRs MUST include a manual verification note confirming the page was tested (or visually inspected) at
  mobile (≤ 480 px), tablet (768 px), and desktop (1280 px) widths.

**Rationale**: The project's target users access Google Sheets add-on dialogs and hosted pages from a variety
of devices including mobile phones. A mobile-first approach ensures a baseline usable experience on the most
constrained viewport before progressively enhancing for larger screens.

## Technology Stack & Constraints

| Concern           | Choice                                                         |
| ----------------- | -------------------------------------------------------------- |
| Language          | TypeScript 5.x                                                 |
| GAS Runtime       | V8 (ESNext target)                                             |
| Bundler           | Webpack 5 (single-file output: `Code.js`)                      |
| GAS Client        | @google/clasp v2.x                                             |
| Linter            | ESLint 8 + @typescript-eslint + eslint-plugin-googleappsscript |
| Formatter         | Prettier 3 (printWidth 110)                                    |
| CI                | GitHub Actions (lint + build gate)                             |
| Exception Logging | Stackdriver (Cloud Logging)                                    |
| Secret Storage    | GAS PropertiesService                                          |
| Test Framework    | None (GAS environment; integration tests run directly in GAS)  |

**GAS Quota awareness**: All features MUST be designed within free-tier GAS limits (6-min execution, 100
emails/day for consumer accounts, UrlFetch quota). Features that may exceed quotas MUST include quota guard
checks.

## Development Workflow

**Day-to-day**:

1. Write / edit TypeScript in `src/`.
2. Run `npm run lint` and `npm run build` locally to validate before pushing.
3. Push to a feature branch and open a PR against `main`.
4. GitHub Actions MUST pass (lint + build) before the PR is mergeable.
5. After merge to `main`, deploy with `npm run push` (test deployment) or `npm run deploy` (versioned
   deployment).

**Branch protection**: The `main` branch MUST be protected. Direct pushes to `main` are prohibited for any
multi-developer setup. All changes arrive via Pull Request.

**Code review gates**:

- TypeScript strict mode passes (`npm run build` exits 0).
- ESLint passes with zero errors (`npm run lint` exits 0).
- No hard-coded secrets or credentials.
- Observable logging present on all new critical paths.
- Constitution compliance verified (reviewer checklist).

**Adding a new GAS service**:

- Add the corresponding `@types/google-apps-script` typings if not already present.
- Declare required OAuth scopes in `appsscript.json` under `"oauthScopes"` when needed.

## Governance

This constitution is the authoritative governance document for the Can Thai Binh Duong AutoSendCV GAS project.
It supersedes any informal conventions or prior verbal agreements.

**Amendment procedure**:

1. Open a PR that modifies `.specify/memory/constitution.md`.
2. The PR description MUST state: which principle(s) change, the semantic version bump type (MAJOR / MINOR /
   PATCH), and the rationale.
3. The Sync Impact Report (HTML comment at top of file) MUST be updated.
4. All dependent templates flagged ⚠ in the report MUST be reviewed and updated before merge.
5. Bump `CONSTITUTION_VERSION` according to the rules below.

**Versioning policy**:

- **MAJOR**: Removal or backward-incompatible redefinition of a principle (e.g., removing the
  bundled-deployment mandate).
- **MINOR**: New principle or section added, or materially expanded guidance.
- **PATCH**: Clarifications, wording improvements, typo fixes.

**Compliance review**: Every PR that touches `src/` MUST include a brief verification that its changes do not
violate any principle in this constitution. Reviewers are expected to flag violations before approval.

**Version**: 1.1.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-16
