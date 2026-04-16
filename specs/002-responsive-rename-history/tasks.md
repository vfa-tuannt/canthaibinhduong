# Tasks: Responsive UI, Đổi Tên Sản Phẩm & Lịch Sử Toàn Bộ

**Input**: Design documents from `/specs/002-responsive-rename-history/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual responsive verification per Constitution §VIII.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend (GAS)**: `src/` at repository root
- **Frontend (React)**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the React + Vite + ShadCN UI project in `frontend/` and prepare the development environment

- [x] T001 Remove old vanilla frontend files (`frontend/app.js`, `frontend/style.css`, `frontend/index.html`) and scaffold Vite + React + TypeScript project in `frontend/` with `npm create vite@latest . -- --template react-ts`
- [x] T002 Initialize ShadCN UI in `frontend/` — run `npx shadcn@latest init`, configure `components.json` with New York style and Tailwind CSS
- [x] T003 Configure custom Tailwind breakpoints in `frontend/tailwind.config.ts` per Constitution §VIII (mobile ≤480px default, tablet `min-width: 481px`, desktop `min-width: 1025px`)
- [x] T004 [P] Install ShadCN UI components via CLI: `npx shadcn@latest add button input label card dialog table select badge sheet skeleton textarea sonner`
- [x] T005 [P] Create API helper module in `frontend/src/lib/api.ts` — fetch wrapper for GAS `doPost` endpoint with typed request/response interfaces per `contracts/gas-client-server.md`
- [x] T006 [P] Create auth state hook in `frontend/src/hooks/use-auth.ts` — manages `sessionToken` in localStorage, provides `login()`, `logout()`, `isAuthenticated` state
- [x] T007 Update GitHub Actions workflow in `.github/workflows/deploy-pages.yml` to run `cd frontend && npm ci && npm run build` and deploy `frontend/dist/` instead of raw `frontend/`

**Checkpoint**: React + ShadCN project builds successfully, `npm run dev` shows blank page, API helper is ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI shell that ALL user stories depend on — app layout, routing, login, and responsive navbar

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create root App component with view-based routing in `frontend/src/App.tsx` — manages current view state (login, products, history, dashboard), renders navbar + active page
- [x] T009 Create responsive navbar component in `frontend/src/components/navbar.tsx` — desktop: horizontal nav links (Sản phẩm, Lịch sử, Dashboard, Đăng xuất); mobile: hamburger icon opening ShadCN `Sheet` drawer with nav items; all touch targets ≥44×44px
- [x] T010 Create login page in `frontend/src/pages/login.tsx` — ShadCN `Card` + `Input` + `Button` + `Label`, calls `login()` API, stores token via `use-auth` hook, responsive layout (centered card, max-width on mobile)
- [x] T011 Create products page shell in `frontend/src/pages/products.tsx` — loads product list via `getProducts` API, renders `product-table` component, includes search input and "Thêm sản phẩm" button
- [x] T012 Create product table component in `frontend/src/components/product-table.tsx` — Desktop (≥1025px): ShadCN `Table` with all columns; Mobile/Tablet (<1025px): card-based layout showing variant name, stock, and action buttons without horizontal scroll. All touch targets ≥44px
- [x] T013 Create stock adjustment dialog in `frontend/src/components/adjust-dialog.tsx` — ShadCN `Dialog` with two toggle buttons ("Nhập kho" / "Xuất kho") instead of Select dropdown, `Input` (quantity), `Textarea` (note), calls `adjustStock` API, shows success/error via `Sonner` toast
- [x] T014 Create add variant dialog in `frontend/src/components/variant-dialog.tsx` — ShadCN `Dialog` with `Input` fields (name, code, initial stock), calls `createVariant` API
- [x] T015 Create add product dialog using ShadCN `Dialog` in `frontend/src/pages/products.tsx` — `Input` for product name, calls `createProduct` API
- [x] T016 Create dashboard page in `frontend/src/pages/dashboard.tsx` — port existing dashboard rendering from vanilla JS to React with ShadCN `Table` + `Select` (year, product filter), responsive layout
- [x] T017 Create per-variant history view — when clicking "Lịch sử" on a variant row, show ShadCN `Dialog` or navigate to inline view with `getAdjustmentHistory` API call, date filter inputs, ShadCN `Table` rendering

**Checkpoint**: Foundation ready — full app shell works with login, product list, stock adjustment, variant CRUD, dashboard, per-variant history. All pages responsive at 3 viewports. User story implementation can begin.

---

## Phase 3: User Story 1 — Xem và thao tác trên điện thoại (Priority: P1) 🎯 MVP

**Goal**: All existing functionality works flawlessly on mobile viewport (≤480px) with mobile-first styling

**Independent Test**: Open app at ≤480px viewport → login, view products, adjust stock, view history — no horizontal page scroll, all buttons ≥44px touch target

### Implementation for User Story 1

- [x] T018 [US1] Audit and fix login page for mobile in `frontend/src/pages/login.tsx` — ensure card fits within viewport, inputs are full-width, button is ≥44px height, no horizontal overflow
- [x] T019 [US1] Audit and fix navbar for mobile in `frontend/src/components/navbar.tsx` — verify hamburger menu triggers Sheet drawer, nav items are stacked vertically with ≥44px tap targets, drawer closes on navigation
- [x] T020 [US1] Audit and fix product table for mobile in `frontend/src/components/product-table.tsx` — mobile/tablet uses card-based layout (no horizontal scroll), desktop uses traditional table. All action buttons visible without scrolling, touch targets ≥44px
- [x] T021 [US1] Audit and fix all dialogs for mobile (adjust-dialog, variant-dialog, product add dialog) — verify `DialogContent` uses `max-w-[95vw]` on mobile, form fields are full-width, submit buttons are ≥44px
- [x] T022 [US1] Audit and fix dashboard page for mobile in `frontend/src/pages/dashboard.tsx` — verify tables have `overflow-x-auto`, filter controls stack vertically, select dropdowns are full-width
- [x] T023 [US1] Verify responsive layout at mobile (≤480px) — Constitution §VIII: no horizontal page scroll, all touch targets ≥44×44px, viewport meta tag present in `frontend/index.html`

**Checkpoint**: All pages and modals are fully usable on mobile (≤480px). No horizontal scrollbars at page level.

---

## Phase 4: User Story 2 — Xem và thao tác trên tablet (Priority: P1)

**Goal**: Layout optimized for tablet viewport (768–1024px), utilizing extra space over mobile

**Independent Test**: Open app at 768px viewport → login, view products, adjust stock — tables show more columns, forms use wider layout, navbar shows all links horizontally

### Implementation for User Story 2

- [x] T024 [US2] Optimize navbar for tablet in `frontend/src/components/navbar.tsx` — show full horizontal nav links at `md:` breakpoint (≥768px) instead of hamburger menu
- [x] T025 [US2] Optimize product table for tablet in `frontend/src/components/product-table.tsx` — tablet uses card-based layout (same as mobile, no horizontal scroll needed), desktop shows full table with all columns at `md:` breakpoint
- [x] T026 [US2] Optimize dialogs for tablet — `DialogContent` at `sm:max-w-[425px]` width, form inputs on wider layout where appropriate
- [x] T027 [US2] Optimize dashboard tables for tablet in `frontend/src/pages/dashboard.tsx` — tables show all columns without scroll, filter controls in horizontal row at `md:` breakpoint
- [x] T028 [US2] Verify responsive layout at tablet (768px) and desktop (1280px) — Constitution §VIII: tables show all main columns, nav is horizontal, optimal spacing

**Checkpoint**: Tablet users see optimized layout that uses extra screen space. Desktop remains unchanged.

---

## Phase 5: User Story 3 — Đổi tên sản phẩm (Priority: P2)

**Goal**: Users can rename existing products. Variants and history are unaffected.

**Independent Test**: Rename a product → name updates in list, variants and history intact. Duplicate/empty name rejected.

### Implementation for User Story 3

- [x] T029 [P] [US3] Implement `renameProduct()` function in `src/products.ts` — accepts `(token, productId, newName)`, validates session, checks non-empty trimmed name, checks case-insensitive duplicate, finds product row by ID, updates column B (name), logs operation per contracts/gas-client-server.md
- [x] T030 [P] [US3] Export `renameProduct` from `src/products.ts` and add `"renameProduct"` case to `doPost()` switch in `src/index.ts` — maps `params.token`, `params.productId`, `params.newName`
- [x] T031 [US3] Add `renameProduct` API call to `frontend/src/lib/api.ts` — typed function `renameProduct(token, productId, newName): Promise<MutationResult>`
- [x] T032 [US3] Create rename dialog component in `frontend/src/components/rename-dialog.tsx` — ShadCN `Dialog` with `Input` pre-filled with current product name, submit button calls `renameProduct` API, shows success toast or error message, refreshes product list on success
- [x] T033 [US3] Add rename button/icon to product row in `frontend/src/components/product-table.tsx` — adds a rename action button (pencil icon) on each product row, opens `rename-dialog` with product ID and current name
- [x] T034 [US3] Verify rename dialog responsive at mobile (≤480px), tablet (768px), desktop (1280px) — Constitution §VIII

**Checkpoint**: Product rename works end-to-end. Variants and history are unaffected by rename.

---

## Phase 6: User Story 4 — Xem lịch sử toàn bộ sản phẩm (Priority: P2)

**Goal**: Dedicated global history page showing all stock adjustments across all products, with date and product filters

**Independent Test**: Open global history page → see all adjustments (newest first), filter by date range, filter by product, combine filters

### Implementation for User Story 4

- [x] T035 [P] [US4] Implement `getAllAdjustmentHistory()` function in `src/inventory.ts` — accepts `(token)`, validates session, reads all AdjustmentHistory rows, enriches each record with `variantName` (from Variants sheet) and `productId`/`productName` (from Products sheet via Variant.productId), sorts by `createdAt` descending, limits to 5000 records, returns `GlobalHistoryResult` per contracts/gas-client-server.md
- [x] T036 [P] [US4] Export `getAllAdjustmentHistory` from `src/inventory.ts` and add `"getAllAdjustmentHistory"` case to `doPost()` switch in `src/index.ts` — maps `params.token`
- [x] T037 [US4] Add `getAllAdjustmentHistory` API call to `frontend/src/lib/api.ts` — typed function returning `Promise<GlobalHistoryResult>` with `EnrichedAdjustmentRecord[]`
- [x] T038 [US4] Create global history page in `frontend/src/pages/history.tsx` — calls `getAllAdjustmentHistory` API on mount, stores full data in state, renders filter controls (date range inputs + product `Select` dropdown populated from unique product names in data) and `history-table` component
- [x] T039 [US4] Create history table component in `frontend/src/components/history-table.tsx` — Desktop (≥768px): ShadCN `Table` with all columns and full datetime in Vietnam timezone (+7); Mobile/Tablet (<768px): card-based layout showing product name, variant name, stock before→after, quantity, note, and precise timestamp (HH:mm:ss, Vietnam +7) without horizontal scroll
- [x] T040 [US4] Implement client-side filtering in `frontend/src/pages/history.tsx` — filter `data[]` by date range (`createdAt.substring(0,10)` vs `fromDate`/`toDate`) AND by product (`productId` vs selected product dropdown), show empty state message "Không có dữ liệu phù hợp" when no results match
- [x] T041 [US4] Add "Lịch sử" navigation link to navbar in `frontend/src/components/navbar.tsx` — adds navigation item between "Sản phẩm" and "Dashboard", navigates to global history page
- [x] T042 [US4] Verify global history page responsive at mobile (≤480px), tablet (768px), desktop (1280px) — Constitution §VIII: filter controls stack on mobile, table scrollable horizontally on mobile, all columns visible on tablet+

**Checkpoint**: Global history page works end-to-end. Users can see all adjustments and filter by date and product.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T043 [P] Verify `npm run build` (backend) and `cd frontend && npm run build` (frontend) both exit 0
- [x] T044 [P] Verify `npm run lint` (backend) exits 0 with new code in `src/products.ts` and `src/index.ts`
- [x] T045 Run quickstart.md validation — test both new API actions (`renameProduct`, `getAllAdjustmentHistory`) manually via curl or browser
- [x] T046 Final responsive audit across ALL pages at all 3 viewports (mobile ≤480px, tablet 768px, desktop 1280px) — document verification per Constitution §VIII

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — audits and fixes mobile responsive issues
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (different breakpoints)
- **US3 (Phase 5)**: Depends on Phase 2 — backend tasks (T029, T030) can start immediately after Phase 1; frontend tasks depend on Phase 2
- **US4 (Phase 6)**: Depends on Phase 2 — backend tasks (T035, T036) can start immediately after Phase 1; frontend tasks depend on Phase 2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Mobile)**: Depends on Phase 2 only. No dependency on other user stories.
- **US2 (Tablet)**: Depends on Phase 2 only. Can run in parallel with US1.
- **US3 (Rename)**: Backend independent of frontend. Frontend depends on Phase 2.
- **US4 (Global History)**: Backend independent of frontend. Frontend depends on Phase 2.

### Within Each User Story

- Backend tasks (T029-T030, T035-T036) can be done independently of frontend
- Frontend API wrappers → components → page integration → responsive verification
- Responsive verification is always the last task in each user story

### Parallel Opportunities

**After Phase 1 (Setup)**:
- T005, T006 can run in parallel (different files)
- T004 can run in parallel with T005/T006

**After Phase 2 (Foundational)**:
- US1, US2, US3 (frontend), US4 (frontend) can ALL start in parallel
- US3 backend (T029, T030) and US4 backend (T035, T036) can start during Phase 2

**Within Phase 5 (US3)**:
- T029 and T030 (backend) run in parallel with Phase 2 frontend work
- T031 → T032 → T033 → T034 (sequential within frontend)

**Within Phase 6 (US4)**:
- T035 and T036 (backend) run in parallel with Phase 2 frontend work
- T037 → T038 → T039 → T040 → T041 → T042 (sequential within frontend)

---

## Implementation Strategy

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1: Mobile) — delivers a fully functional, mobile-responsive app with all existing features ported to React + ShadCN UI.

**Incremental Delivery**:
1. Phase 1–2: Foundation (React + ShadCN setup, all existing features ported)
2. Phase 3: Mobile responsive polish (P1)
3. Phase 4: Tablet responsive optimization (P1)
4. Phase 5: Product rename feature (P2)
5. Phase 6: Global history page (P2)
6. Phase 7: Final polish and validation
