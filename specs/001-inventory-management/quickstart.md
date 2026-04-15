# Quickstart: Inventory Management System

**Feature**: 001-inventory-management  
**Date**: 2026-04-15

## Prerequisites

1. Node.js (LTS) installed
2. Google account with access to the target GAS project
3. `clasp` authenticated: `npm run login`

## Setup

```bash
# Clone and install
git clone <repo-url>
cd canthaibinhduong
npm install

# Verify build works
npm run build
```

## Initial Deployment

### 1. Configure credentials in GAS

After deploying for the first time, set the authentication credentials via the GAS Script Editor or programmatically:

```javascript
// Run once in GAS Script Editor console:
PropertiesService.getScriptProperties().setProperties({
  'AUTH_USERNAME': 'tienha',
  'AUTH_PASSWORD': 'hatien'
});
```

### 2. Create required Sheets

The app expects a Google Spreadsheet with 3 sheets:
- **Products** — Row 1: `id | name | createdAt`
- **Variants** — Row 1: `id | productId | variantName | variantCode | currentStock | createdAt`
- **AdjustmentHistory** — Row 1: `id | variantId | adjustmentType | quantity | stockBefore | stockAfter | note | createdAt`

These sheets will be auto-created on first run if they don't exist.

### 3. Deploy

```bash
# Build and push to GAS
npm run push

# For versioned deployment
npm run deploy
```

### 4. Access the web app

1. Open the GAS project in the Script Editor.
2. Click **Deploy** → **Test deployments** (or **New deployment** → **Web app**).
3. Set access to "Anyone" (ANYONE_ANONYMOUS for personal accounts).
4. Open the deployed URL in a browser.
5. Login with username `tienha` and password `hatien`.

## Development Workflow

```bash
# Edit TypeScript in src/
# Lint
npm run lint

# Build (tsc → webpack → Code.js)
npm run build

# Push to GAS (build + clasp push)
npm run push

# Format code
npm run format
```

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Entry point — all GAS-callable functions |
| `src/auth.ts` | Login/session management |
| `src/products.ts` | Product & variant CRUD |
| `src/inventory.ts` | Stock adjustments + history |
| `src/dashboard.ts` | Monthly aggregation |
| `src/sheets.ts` | Google Sheets data access helpers |
| `src/html/index.html` | UI shell (SPA-like) |
| `src/html/css.html` | Embedded styles |
| `src/html/js.html` | Client-side JavaScript |

## Troubleshooting

- **Build fails**: Check `tsconfig.json` strict settings; ensure no `any` types without justification.
- **`clasp push` fails**: Ensure `.clasp.json` has the correct Script ID; run `npm run login` if auth expired.
- **Sheets not found**: Verify the Spreadsheet has sheets named exactly `Products`, `Variants`, `AdjustmentHistory`.
- **Login not working**: Verify `ScriptProperties` have `AUTH_USERNAME` and `AUTH_PASSWORD` set.
- **GAS timeout**: Check Stackdriver logs for long-running operations; ensure batch reads are used.
