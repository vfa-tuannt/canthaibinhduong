# GAS Server ↔ React Client Contract (Feature 002 Additions)

**Feature**: 002-responsive-rename-history  
**Date**: 2026-04-16  
**Protocol**: REST via `fetch` → GAS `doPost` (JSON request/response)  
**Base contract**: See `specs/001-inventory-management/contracts/gas-client-server.md` for existing endpoints.

## Overview

This document defines the **new** API actions added in feature 002. All existing actions from feature 001 remain unchanged. Communication protocol is the same: HTTP POST to the GAS deployment URL with JSON body `{ action, params }`.

### Request Format (unchanged)

```typescript
interface APIRequest {
  action: string;
  params: Record<string, unknown>;
}
```

### Response Format (unchanged)

All responses are JSON with a `success` boolean and either data or `error` string.

---

## New Actions

### `renameProduct` — Rename an existing product

**Action**: `"renameProduct"`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |
| productId | string | yes | ID of the product to rename |
| newName | string | yes | New product name |

**Returns**:
```typescript
interface MutationResult {
  success: boolean;
  error?: string;
}
```

**Validation**:
- `newName` MUST NOT be empty or whitespace-only after trimming
- `newName` MUST NOT match any existing product name (case-insensitive)
- `productId` MUST exist in the Products sheet

**Errors**:
| Condition | Error message |
|-----------|---------------|
| Invalid session | `"Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."` |
| Empty name | `"Tên sản phẩm không được để trống."` |
| Duplicate name | `"Sản phẩm đã tồn tại."` |
| Product not found | `"Sản phẩm không tồn tại."` |

**Side effects**: Updates column B of the matching row in the Products sheet. Does NOT affect Variants or AdjustmentHistory sheets.

**Logging**: Logs `renameProduct: id={productId} oldName="{old}" newName="{new}"` on success.

---

### `getAllAdjustmentHistory` — Get history for all products

**Action**: `"getAllAdjustmentHistory"`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| token | string | yes | Valid session token |

**Returns**:
```typescript
interface EnrichedAdjustmentRecord {
  id: string;
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  adjustmentType: "IMPORT" | "EXPORT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string;
  createdAt: string;
}

interface GlobalHistoryResult {
  success: boolean;
  data?: EnrichedAdjustmentRecord[];
  error?: string;
}
```

**Behavior**:
- Returns ALL adjustment history records enriched with variant name and product name.
- Records sorted by `createdAt` descending (newest first).
- Maximum 5000 records returned (oldest records truncated if exceeded).
- If a variant or product is not found during enrichment, `variantName` / `productName` default to `"(Đã xóa)"`.

**Errors**:
| Condition | Error message |
|-----------|---------------|
| Invalid session | `"Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."` |

**Logging**: Logs `getAllAdjustmentHistory: returned {count} records` on success.

---

## `doPost` Switch-Case Additions

The following cases are added to `src/index.ts` `doPost()`:

```typescript
case "renameProduct":
  result = renameProduct(params.token, params.productId, params.newName);
  break;
case "getAllAdjustmentHistory":
  result = getAllAdjustmentHistory(params.token);
  break;
```

---

## Client-Side Filtering (Global History)

Filtering of the global history data happens **client-side** in the React frontend. The API does NOT accept filter parameters. The client filters the returned `data[]` array by:

1. **Date range**: Compare `createdAt.substring(0, 10)` against selected `fromDate` / `toDate`
2. **Product**: Compare `productId` against selected product dropdown value

This approach avoids API complexity while data volume is under 5000 records (per spec assumption).
