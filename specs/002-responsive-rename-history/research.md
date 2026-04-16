# Research: Responsive UI, Đổi Tên Sản Phẩm & Lịch Sử Toàn Bộ

**Feature**: 002-responsive-rename-history  
**Date**: 2026-04-16

## R1: ShadCN UI Framework Requirements

**Task**: "Research ShadCN UI dependencies and compatibility with GAS project"

**Decision**: Migrate `frontend/` from vanilla HTML/JS/CSS to React + Vite + ShadCN UI. Keep `src/html/` (GAS-served) as a minimal fallback with Tailwind CSS CDN for basic styling consistency.

**Rationale**:
- ShadCN UI requires React (supports Next.js, Vite, React Router, Astro, TanStack Start). There is no plain HTML/CSS version.
- The `frontend/` directory is already a standalone web app that communicates with GAS backend via REST (`fetch` + `doPost`). It does NOT depend on `google.script.run` — it uses a hardcoded API_URL. This makes it fully decoupled from GAS and perfect for React migration.
- `src/html/` is the GAS-served version using `google.script.run` internally. GAS HTML Service has severe limitations (no ES modules, no build tooling). It cannot run React. We keep it as a lightweight fallback and apply Tailwind CSS via CDN for responsive styling.
- Vite is the simplest React setup (vs Next.js which adds SSR complexity unnecessary for a static SPA).

**Alternatives considered**:
- *Tailwind CSS only (no React)*: Would provide responsive design but miss ShadCN's component library (Dialog, Table, Select, Sheet, etc.). User explicitly requested ShadCN.
- *Next.js*: Overkill for a static SPA deployed to GitHub Pages. Adds SSR/ISR complexity with no benefit for a GAS-backed app.
- *Web Components mimicking ShadCN*: No mature library exists. Would require building from scratch — violates YAGNI.

## R2: React + Vite + GitHub Pages Integration

**Task**: "Research how to deploy Vite React app to GitHub Pages while maintaining GAS backend"

**Decision**: Use Vite to build the React app. Configure GitHub Actions to run `npm run build` in `frontend/` and deploy `frontend/dist/` instead of raw `frontend/`.

**Rationale**:
- Vite outputs a static `dist/` folder with `index.html`, JS bundles, and CSS — perfect for GitHub Pages.
- The existing GAS `doPost` API remains unchanged. The React app will call the same REST API using `fetch`.
- `frontend/` becomes a self-contained React project with its own `package.json`, `vite.config.ts`, etc.
- The root `package.json` (for GAS backend) remains separate and unchanged.

**Alternatives considered**:
- *Single package.json for everything*: Mixing GAS backend deps with React frontend deps creates confusion and potential conflicts. Separate `package.json` is cleaner.
- *Monorepo with workspaces*: Premature for a 2-person project. YAGNI.

## R3: ShadCN Components for Feature Requirements

**Task**: "Research which ShadCN components map to feature requirements"

**Decision**: Use the following ShadCN components:

| Feature Requirement | ShadCN Component(s) |
|---|---|
| Navigation (responsive) | `Sheet` (mobile drawer) + custom navbar |
| Product list table | `Table` + `Badge` |
| Product rename modal | `Dialog` + `Input` + `Button` |
| Stock adjustment modal | `Dialog` + `Select` + `Input` + `Textarea` + `Button` |
| Global history page | `Table` + `Badge` + `Select` + date `Input` |
| Filter controls | `Select` (product dropdown) + native `<input type="date">` |
| Empty states | `Card` or inline text |
| Loading spinners | `Skeleton` or custom spinner |
| Success/Error messages | `Alert` or `Toast` (via `Sonner`) |
| Login form | `Card` + `Input` + `Button` + `Label` |
| Pagination | `Pagination` component (for history >100 records) |

**Rationale**: ShadCN provides all these components out-of-the-box with consistent styling, accessibility, and Tailwind CSS integration. No need for custom component development.

**Alternatives considered**:
- *Build custom components*: Unnecessary when ShadCN provides production-ready, accessible versions.
- *Mix ShadCN with other libraries*: Creates inconsistent UX. ShadCN is comprehensive enough.

## R4: Mobile-First Responsive Strategy with ShadCN

**Task**: "Research mobile-first responsive patterns with ShadCN + Tailwind"

**Decision**: Use Tailwind CSS responsive utilities (mobile-first by default) with ShadCN's built-in responsive patterns:

- **Navbar**: Desktop = horizontal nav links. Mobile/Tablet = hamburger icon opening `Sheet` component (slide-in drawer).
- **Tables**: Wrap in `div.overflow-x-auto` on mobile. On small screens, use ShadCN `Table` with horizontally scrollable container.
- **Modals/Dialogs**: ShadCN `Dialog` is responsive by default (`max-w-[95vw]` on mobile). Add `DialogContent` with `sm:max-w-[425px]`.
- **Forms**: Stack vertically on mobile (default), side-by-side inputs on tablet+ using Tailwind `sm:flex`.
- **Breakpoints**: Use Tailwind defaults which align with Constitution §VIII:
  - Default (no prefix): mobile ≤ 640px
  - `sm:` → 640px
  - `md:` → 768px (tablet)
  - `lg:` → 1024px (desktop)

**Rationale**: Tailwind CSS is inherently mobile-first (`min-width` media queries). ShadCN builds on Tailwind, so responsive design is natural. Constitution §VIII breakpoints (480/481/1025) will be configured as custom Tailwind breakpoints in `tailwind.config.ts`.

**Alternatives considered**:
- *CSS Grid/Flexbox only (no Tailwind)*: Requires writing all responsive CSS by hand. Tailwind + ShadCN provides utility classes that dramatically reduce CSS code.
- *Container queries*: Not yet universally supported. Standard media queries are more reliable.

## R5: GAS-Served HTML (`src/html/`) Responsive Approach

**Task**: "Research how to make GAS-served HTML responsive without React"

**Decision**: Apply Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com">`) to `src/html/css.html`. Rewrite CSS using Tailwind utility classes for responsive layout. No React — keep vanilla JS via `google.script.run`.

**Rationale**:
- GAS HTML Service does not support ES modules or build tooling, so React/Vite cannot run there.
- Tailwind CDN is a single `<script>` tag — works within GAS HTML Service constraints.
- The GAS-served frontend is a fallback for direct GAS execution (not the primary user-facing frontend). Minimal investment is appropriate.
- Keeps visual consistency with the main ShadCN/Tailwind-based React frontend.

**Alternatives considered**:
- *Custom responsive CSS*: More work, less consistency with the React frontend.
- *Remove GAS-served frontend entirely*: Not advisable — it's needed for `doGet` and for users who access the script directly from Google Sheets.

## R6: Rename Product Backend Design

**Task**: "Research how to implement product rename in GAS backend"

**Decision**: Add `renameProduct(token, productId, newName)` function in `src/products.ts`. Update the product row in the Products sheet. Since Variants and AdjustmentHistory reference products by `productId` (not by name), renaming has zero impact on related data.

**Rationale**:
- Products sheet structure: `[id, name, createdAt]`. Only column 2 (name) changes.
- Variants link to products via `productId` (column 2 in Variants sheet). Name is not stored in Variants.
- AdjustmentHistory links to `variantId`, not to product name.
- When rendering history, the product name is looked up from the Products sheet at display time — so a rename is automatically reflected everywhere.

**Alternatives considered**:
- *Add audit log for renames*: Spec explicitly states no audit log needed. YAGNI.
- *Use LockService for rename*: Not needed — name collisions are checked before write, and the operation is idempotent. Last-write-wins is acceptable per spec edge case.

## R7: Global History API Design

**Task**: "Research how to implement global history endpoint for all products"

**Decision**: Add `getAllAdjustmentHistory(token)` function in `src/inventory.ts` that returns all adjustment history records enriched with product name and variant name. Client-side filtering by date and product. Server returns maximum 5000 records sorted by `createdAt` descending.

**Rationale**:
- Current `getAdjustmentHistory` filters by a single `variantId`. The new API returns ALL records.
- Enrichment: For each history record, look up the variant row (to get `variantName`, `productId`), then look up the product row (to get `name`). This join is done server-side to minimize client logic.
- 5000 record limit: GAS has a 6-minute execution limit. Google Sheets read of 5000 rows is well within this limit (~2-3 seconds). Client-side filtering of 5000 records is fast in modern browsers.
- If data grows beyond 5000: Add server-side pagination in a future iteration.

**Alternatives considered**:
- *Server-side filtering*: Adds complexity to the API. For <5000 records, client-side filtering is simpler and more responsive (no round-trip per filter change).
- *Return only recent N days*: Too restrictive. Users may need older history.
