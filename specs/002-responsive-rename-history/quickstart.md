# Quickstart: Responsive UI, Đổi Tên Sản Phẩm & Lịch Sử Toàn Bộ

**Feature**: 002-responsive-rename-history  
**Date**: 2026-04-16

## Prerequisites

- Node.js 18+
- npm 9+
- `@google/clasp` authenticated (`clasp login`)
- GAS project with `SPREADSHEET_ID` configured in ScriptProperties

## 1. Backend Changes (GAS)

### Install / Build

```bash
# From repo root — no new backend dependencies
npm run build
```

### Verify new API actions

After `npm run push`, test via curl or browser console:

```bash
# Rename product
curl -X POST "YOUR_GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"renameProduct","params":{"token":"YOUR_TOKEN","productId":"P001","newName":"CÂN MỚI"}}'

# Get global history
curl -X POST "YOUR_GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"getAllAdjustmentHistory","params":{"token":"YOUR_TOKEN"}}'
```

Expected: `{"success":true,...}` for both.

## 2. Frontend Changes (React + ShadCN)

### Initial Setup (one-time)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The dev server runs at `http://localhost:5173`. Update `API_URL` in `src/lib/api.ts` if needed.

### Key ShadCN Components Used

```bash
# These are installed during project setup via shadcn CLI
npx shadcn@latest add button input label card dialog table select badge alert sheet skeleton pagination textarea
```

### Verify Responsive Features

Open the dev server and test at three viewports:

| Viewport | Width | What to verify |
|----------|-------|----------------|
| Mobile | ≤480px | Hamburger menu, stacked layout, scrollable tables, touch-friendly buttons |
| Tablet | 768px | Full navbar, wider forms, tables fit without horizontal scroll |
| Desktop | 1280px | Full layout, all columns visible, optimal spacing |

### Verify Product Rename

1. Navigate to Products page
2. Click rename icon/button on any product row
3. Enter new name → confirm
4. Verify product list updates immediately
5. Verify variant history is unchanged

### Verify Global History

1. Click "Lịch sử" in navbar
2. Verify all products' history appears (newest first)
3. Filter by date range → verify filtered results
4. Filter by product → verify filtered results
5. Combine both filters → verify intersection

## 3. Deploy

### Backend

```bash
npm run push    # Test deployment
npm run deploy  # Versioned deployment
```

### Frontend

Push to `main` branch → GitHub Actions deploys `frontend/dist/` to GitHub Pages automatically.

```bash
git push origin main
```

## 4. Validation Checklist

- [ ] `npm run build` exits 0 (backend)
- [ ] `npm run lint` exits 0 (backend)
- [ ] `cd frontend && npm run build` exits 0 (frontend)
- [ ] `renameProduct` API returns success
- [ ] `getAllAdjustmentHistory` API returns enriched records
- [ ] Mobile viewport (≤480px): no horizontal page scroll, touch targets ≥44px
- [ ] Tablet viewport (768px): tables show all main columns
- [ ] Desktop viewport (1280px): full layout renders correctly
- [ ] Product rename: name updates, variants/history unchanged
- [ ] Global history: filters by date and product work correctly
