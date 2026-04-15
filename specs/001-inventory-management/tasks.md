# Tasks: Inventory Management System

**Input**: Design documents from `/specs/001-inventory-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested in feature specification. No test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (GAS Web App)
- HTML files under `src/html/` (served via `HtmlService.createTemplateFromFile()`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, clean up template code, configure Webpack for HTML includes

- [X] T001 Remove template example code from `src/example.ts` and clean up `src/index.ts` to remove `helloWorld` export
- [X] T002 Configure Webpack `copy-webpack-plugin` or adjust build pipeline to include `src/html/*.html` files alongside `Code.js` for clasp push in `webpack.config.js`
- [X] T003 [P] Verify `appsscript.json` has correct `webapp` configuration (`access: "ANYONE_ANONYMOUS"`, `executeAs: "USER_DEPLOYING"`) and `oauthScopes` include Spreadsheet access

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Google Sheets data-access layer and shared utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Implement Google Sheets helper module with `getOrCreateSheet`, `getAllRows`, `appendRow`, `updateRow`, `findRowById`, `generateId` functions in `src/sheets.ts`
- [X] T005 [P] Create the HTML shell for SPA with view-switching (login view, products view, adjustment view, dashboard view, history view) and `include()` helper function for CSS/JS in `src/html/index.html`
- [X] T006 [P] Create base CSS styles (layout, forms, tables, buttons, navigation, loading spinners, error messages) in `src/html/css.html`
- [X] T007 [P] Create client-side JavaScript skeleton with view navigation, `google.script.run` wrapper, session token management, and error display utilities in `src/html/js.html`

**Checkpoint**: Foundation ready — sheets helper tested manually, HTML shell loads with view switching

---

## Phase 3: User Story 1 — Đăng nhập hệ thống (Priority: P1) 🎯 MVP

**Goal**: User can log in with username/password, access the app, and be protected from unauthorized access

**Independent Test**: Open the web app URL → see login form → enter tienha/hatien → get redirected to main view. Wrong credentials show error. Refresh requires re-login.

### Implementation for User Story 1

- [X] T008 [US1] Implement `login(username, password)` function that validates against `ScriptProperties` (AUTH_USERNAME, AUTH_PASSWORD), generates session token via `Utilities.getUuid()`, stores in `PropertiesService.getScriptProperties()` with 7-day TTL (JSON with expiresAt timestamp), and returns `LoginResult` in `src/auth.ts`
- [X] T009 [US1] Implement `validateSession(token)` function that checks `PropertiesService.getScriptProperties()` for valid token and verifies expiry timestamp in `src/auth.ts`
- [X] T010 [US1] Implement `logout(token)` function that removes token from `PropertiesService.getScriptProperties()` in `src/auth.ts`
- [X] T011 [US1] Implement `doGet()` function that serves the HTML app via `HtmlService.createTemplateFromFile('html/index').evaluate().setTitle('Quản lý tồn kho').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)` in `src/index.ts`
- [X] T012 [US1] Export `login`, `validateSession`, `logout` from `src/index.ts`
- [X] T013 [US1] Implement login form UI (username/password fields, submit button, error message area) and wire to `google.script.run.login()` with success/failure handlers; on success store token in JS variable and switch to products view in `src/html/js.html`
- [X] T014 [US1] Add session validation on app load — check `localStorage` for saved token, call `google.script.run.validateSession()` to verify; if valid auto-login, if not show login view in `src/html/js.html`
- [X] T015 [US1] Add `console.log` for login attempts (success/failure) and session validation calls in `src/auth.ts`

**Checkpoint**: User can open the web app, log in with tienha/hatien, see the main view, and be denied with wrong credentials

---

## Phase 4: User Story 2 — Quản lý sản phẩm và mẫu mã (Priority: P1)

**Goal**: User can create products, create variants under products, view the full product/variant list, and search by name/code

**Independent Test**: After login → create product "CÂN TEST" → add variant "100G/0.01G" → see it in the list → search for "TEST" → find it

### Implementation for User Story 2

- [X] T016 [P] [US2] Implement `createProduct(token, name)` function — validate session, check duplicate name in Products sheet, generate ID (P + sequential), append row, return `MutationResult` in `src/products.ts`
- [X] T017 [P] [US2] Implement `createVariant(token, productId, variantName, variantCode, initialStock)` function — validate session, verify productId exists, check duplicate variant name+code within product, generate ID (V + sequential), append row to Variants sheet, return `MutationResult` in `src/products.ts`
- [X] T018 [US2] Implement `getProducts(token)` function — validate session, read Products and Variants sheets in batch, join variants to their parent products, return `ProductListResult` in `src/products.ts`
- [X] T019 [US2] Implement `searchProducts(token, query)` function — validate session, read Products and Variants sheets, case-insensitive partial match on product name, variant name, or variant code, return matching `ProductListResult` in `src/products.ts`
- [X] T020 [US2] Export `createProduct`, `createVariant`, `getProducts`, `searchProducts` from `src/index.ts`
- [X] T021 [US2] Implement products list UI — table displaying products grouped with their variants (product name, variant name, variant code, current stock), search input field with live filtering, "Add Product" button, "Add Variant" button per product row in `src/html/js.html`
- [X] T022 [US2] Implement create product modal/form — product name input, submit button, success/error feedback, auto-refresh product list on success in `src/html/js.html`
- [X] T023 [US2] Implement create variant modal/form — product selector (dropdown of existing products), variant name input, variant code input, initial stock input (number, >= 0), submit, auto-refresh on success in `src/html/js.html`
- [X] T024 [US2] Add `console.log` for product/variant creation (success with ID, failure with reason) and list/search operations (count returned) in `src/products.ts`

**Checkpoint**: User can create products and variants, see them listed, and search. Data persists in Google Sheets.

---

## Phase 5: User Story 3 — Điều chỉnh số lượng tồn kho (Priority: P1)

**Goal**: User can import/export stock for any variant; each adjustment is recorded in history with before/after quantities

**Independent Test**: Select a variant → import 5 units → stock increases by 5 → export 2 units → stock decreases by 2 → check AdjustmentHistory sheet has 2 rows

### Implementation for User Story 3

- [X] T025 [US3] Implement `adjustStock(token, variantId, type, quantity, note)` function — validate session, acquire `LockService.getScriptLock()`, read current stock from Variants sheet, validate (quantity > 0, EXPORT not exceeding current stock), update stock in Variants sheet, append history row to AdjustmentHistory sheet with stockBefore/stockAfter, release lock, return `AdjustmentResult` in `src/inventory.ts`
- [X] T026 [US3] Export `adjustStock` from `src/index.ts`
- [X] T027 [US3] Implement stock adjustment UI — from the products list, click a variant row to open adjustment panel/modal with: current stock display, adjustment type radio (Import/Export), quantity input (positive integer), note textarea, submit button, success/error feedback with stockBefore/stockAfter display in `src/html/js.html`
- [X] T028 [US3] After successful adjustment, auto-refresh the product list to show updated stock in `src/html/js.html`
- [X] T029 [US3] Add `console.log` for stock adjustments — log variantId, type, quantity, stockBefore, stockAfter on success; log error + variantId on failure in `src/inventory.ts`

**Checkpoint**: User can import/export stock, see updated quantities, and AdjustmentHistory sheet has correct records

---

## Phase 6: User Story 4 — Xem lịch sử điều chỉnh tồn kho (Priority: P2)

**Goal**: User can view the adjustment history for any variant, sorted newest-first, with filtering by date range

**Independent Test**: After several stock adjustments → click "View History" on a variant → see all adjustments with correct timestamps, types, quantities, and before/after stock levels

### Implementation for User Story 4

- [X] T030 [US4] Implement `getAdjustmentHistory(token, variantId)` function — validate session, read AdjustmentHistory sheet, filter by variantId, sort by createdAt descending, return `HistoryResult` in `src/inventory.ts`
- [X] T031 [US4] Export `getAdjustmentHistory` from `src/index.ts`
- [X] T032 [US4] Implement history view UI — table with columns: date/time, type (IMPORT/EXPORT with color coding), quantity, stock before, stock after, note; date range filter inputs (from/to) with client-side filtering; back button to return to products view in `src/html/js.html`
- [X] T033 [US4] Add "View History" button in the products list for each variant that navigates to history view with pre-selected variantId in `src/html/js.html`

**Checkpoint**: User can view full adjustment history per variant, filtered by date range

---

## Phase 7: User Story 5 — Dashboard thống kê theo tháng (Priority: P2)

**Goal**: User can view a dashboard with monthly aggregated import/export totals and product stock summaries

**Independent Test**: After several months of stock adjustments → open Dashboard → see monthly breakdown table with total imports, exports, and adjustment counts per month, plus product stock summary

### Implementation for User Story 5

- [X] T034 [US5] Implement `getDashboardData(token, year)` function — validate session, read AdjustmentHistory sheet, group by month (extract from createdAt using `Utilities.formatDate()`), calculate totalImport/totalExport/adjustmentCount per month; read Products + Variants sheets for product summaries (totalStock, variantCount per product), return `DashboardResult` in `src/dashboard.ts`
- [X] T035 [US5] Export `getDashboardData` from `src/index.ts`
- [X] T036 [US5] Implement dashboard UI — year selector dropdown, monthly summary table (12 rows: month, total import, total export, net change, adjustment count), product summary table (product name, total stock, variant count), product filter dropdown to show per-product monthly detail in `src/html/js.html`
- [X] T037 [US5] Add `console.log` for dashboard data generation — log year, row counts processed, computation time in `src/dashboard.ts`

**Checkpoint**: Dashboard shows accurate monthly aggregations and product summaries

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, validation, and deployment readiness

- [X] T038 [P] Add navigation bar/menu to switch between Products, Dashboard views and Logout button across all views in `src/html/js.html` and `src/html/css.html`
- [X] T039 [P] Add loading spinners/indicators for all `google.script.run` calls to show the user that an operation is in progress in `src/html/js.html`
- [X] T040 [P] Add Vietnamese language labels for all UI elements (buttons, headers, table columns, error messages) in `src/html/index.html`, `src/html/js.html`
- [X] T041 Verify `npm run lint` passes with zero errors across all TypeScript files
- [X] T042 Verify `npm run build` succeeds (exit 0) and produces valid `Code.js`
- [X] T043 Run quickstart.md validation — set ScriptProperties (AUTH_USERNAME, AUTH_PASSWORD), verify all 3 sheets are created, test full login → create product → adjust stock → view history → dashboard workflow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **US1 Login (Phase 3)**: Depends on Foundational (Phase 2) — BLOCKS US2, US3, US4, US5 (auth required for all)
- **US2 Products (Phase 4)**: Depends on US1 (needs auth) — BLOCKS US3 (needs variants to adjust)
- **US3 Adjustment (Phase 5)**: Depends on US2 (needs products/variants to exist)
- **US4 History (Phase 6)**: Depends on US3 (needs adjustment data to display) — can start after Phase 5
- **US5 Dashboard (Phase 7)**: Depends on US3 (needs adjustment data) — can start in parallel with US4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational → No dependencies on other stories
- **US2 (P1)**: After US1 → Requires auth module from US1
- **US3 (P1)**: After US2 → Requires products/variants from US2
- **US4 (P2)**: After US3 → Requires adjustment history from US3. Can run in parallel with US5
- **US5 (P2)**: After US3 → Requires adjustment history from US3. Can run in parallel with US4

### Within Each User Story

- Server-side functions before client-side UI
- Export from `src/index.ts` before wiring UI
- Logging added alongside implementation (not deferred)

### Parallel Opportunities

- T005, T006, T007 can run in parallel (different HTML files)
- T016, T017 can run in parallel (independent functions in same file)
- US4 and US5 can run in parallel after US3 is complete
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```text
                    ┌─ T005 index.html (SPA shell)
T004 sheets.ts ──→  ├─ T006 css.html (styles)
                    └─ T007 js.html (client JS skeleton)
```

## Parallel Example: User Story 4 + 5

```text
After US3 complete:
  ├─ US4: T030 → T031 → T032 → T033 (History)
  └─ US5: T034 → T035 → T036 → T037 (Dashboard)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 Login (T008-T015)
4. Complete Phase 4: US2 Products (T016-T024)
5. Complete Phase 5: US3 Adjustment (T025-T029)
6. **STOP and VALIDATE**: Full CRUD + stock adjustment workflow works end-to-end
7. Deploy MVP — user can manage inventory

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Login works → deployable gate
3. Add US2 → Product management works → deployable increment
4. Add US3 → Stock adjustment works → **MVP deployed!**
5. Add US4 → History viewing works → enhanced audit
6. Add US5 → Dashboard works → full analytics
7. Polish → Production-ready

---

## Notes

- No test tasks generated — tests not requested in spec
- All credentials MUST be set via `ScriptProperties` (never hardcoded per Constitution Principle VI)
- GAS HTML files (`.html`) must be included in clasp push — verify `.claspignore` does not exclude `src/html/`
- Commit after each task or logical group
- `npm run build` must pass after every task (Constitution Principle III)
