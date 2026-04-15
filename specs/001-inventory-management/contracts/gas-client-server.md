# GAS Server ↔ HTML Client Contract

**Feature**: 001-inventory-management  
**Date**: 2026-04-15  
**Protocol**: `google.script.run` (GAS HTML Service client → server RPC)

## Overview

All communication between the HTML client (browser) and the GAS server uses `google.script.run`. The client calls exported functions from `src/index.ts`; the server returns plain objects (JSON-serializable). Errors are thrown as `Error` objects caught by `withFailureHandler`.

## Authentication

### `login(username: string, password: string): LoginResult`

Authenticates the user and returns a session token.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| username | string | yes | User-provided username |
| password | string | yes | User-provided password |

**Returns**:
```typescript
interface LoginResult {
  success: boolean;
  token?: string;    // Session token (if success)
  error?: string;    // Error message (if failure)
}
```

**Errors**: None thrown — errors returned in result object.

---

### `validateSession(token: string): boolean`

Checks whether a session token is still valid.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Session token from login |

**Returns**: `boolean` — `true` if session is valid, `false` otherwise.

---

### `logout(token: string): void`

Invalidates a session token.

---

## Product Management

### `getProducts(token: string): ProductListResult`

Returns all products with their variants.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |

**Returns**:
```typescript
interface Product {
  id: string;
  name: string;
  createdAt: string;
  variants: Variant[];
}

interface Variant {
  id: string;
  productId: string;
  variantName: string;
  variantCode: string;
  currentStock: number;
  createdAt: string;
}

interface ProductListResult {
  success: boolean;
  data?: Product[];
  error?: string;
}
```

---

### `searchProducts(token: string, query: string): ProductListResult`

Searches products/variants by name or code. Case-insensitive partial match.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| query | string | yes | Search term (min 1 character) |

**Returns**: Same as `getProducts`.

---

### `createProduct(token: string, name: string): MutationResult`

Creates a new product.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| name | string | yes | Product name (non-empty, unique) |

**Returns**:
```typescript
interface MutationResult {
  success: boolean;
  id?: string;       // Created entity ID
  error?: string;
}
```

**Errors**: Returns `error` if name is empty or duplicate.

---

### `createVariant(token: string, productId: string, variantName: string, variantCode: string, initialStock: number): MutationResult`

Creates a new variant under a product.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| productId | string | yes | Parent product ID |
| variantName | string | yes | Variant display name |
| variantCode | string | yes | Variant code/specification |
| initialStock | number | yes | Initial stock quantity (>= 0) |

**Returns**: `MutationResult`

**Errors**: Returns `error` if productId invalid, names empty, or duplicate variant.

---

## Inventory Adjustment

### `adjustStock(token: string, variantId: string, type: "IMPORT" | "EXPORT", quantity: number, note: string): AdjustmentResult`

Adjusts stock for a variant and records the adjustment in history.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| variantId | string | yes | Target variant ID |
| type | "IMPORT" \| "EXPORT" | yes | Adjustment direction |
| quantity | number | yes | Positive integer |
| note | string | no | Optional note |

**Returns**:
```typescript
interface AdjustmentResult {
  success: boolean;
  stockBefore?: number;
  stockAfter?: number;
  error?: string;
}
```

**Errors**: Returns `error` if:
- Variant not found
- Quantity <= 0 or not an integer
- EXPORT would result in negative stock

**Concurrency**: Uses `LockService.getScriptLock()` internally.

---

### `getAdjustmentHistory(token: string, variantId: string): HistoryResult`

Returns full adjustment history for a variant, newest first.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| variantId | string | yes | Target variant ID |

**Returns**:
```typescript
interface AdjustmentRecord {
  id: string;
  variantId: string;
  adjustmentType: "IMPORT" | "EXPORT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string;
  createdAt: string;
}

interface HistoryResult {
  success: boolean;
  data?: AdjustmentRecord[];
  error?: string;
}
```

---

## Dashboard

### `getDashboardData(token: string, year: number): DashboardResult`

Returns monthly aggregated data for the dashboard.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| year | number | yes | Year to show (e.g., 2026) |

**Returns**:
```typescript
interface MonthlyData {
  month: number;             // 1-12
  totalImport: number;       // Sum of IMPORT quantities
  totalExport: number;       // Sum of EXPORT quantities
  adjustmentCount: number;   // Number of adjustments
}

interface ProductSummary {
  productId: string;
  productName: string;
  totalStock: number;        // Sum of all variant currentStock
  variantCount: number;
}

interface DashboardResult {
  success: boolean;
  monthly?: MonthlyData[];
  products?: ProductSummary[];
  error?: string;
}
```

---

## Error Handling Convention

All server functions follow this pattern:
1. Validate `token` first — return `{ success: false, error: "Unauthorized" }` if invalid.
2. Validate inputs — return `{ success: false, error: "<specific message>" }` for invalid data.
3. Execute business logic — wrap in try/catch, log errors with `console.error`.
4. Return result object — never throw errors that reach the client (use `error` field instead).

## Client-Side Call Pattern

```javascript
// Standard call pattern in js.html
google.script.run
  .withSuccessHandler(function(result) {
    if (result.success) {
      // handle result.data
    } else {
      showError(result.error);
    }
  })
  .withFailureHandler(function(error) {
    showError('Server error: ' + error.message);
  })
  .getProducts(sessionToken);
```
