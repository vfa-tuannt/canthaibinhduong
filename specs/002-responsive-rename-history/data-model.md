# Data Model: Responsive UI, Đổi Tên Sản Phẩm & Lịch Sử Toàn Bộ

**Feature**: 002-responsive-rename-history  
**Date**: 2026-04-16

## Entities

### Product (Sheet: "Products") — EXISTING, MODIFIED

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | string | Unique ID (format: `P###`) |
| B | name | string | Product name — **now MUTABLE** (was effectively immutable before) |
| C | createdAt | string (ISO 8601) | Creation timestamp |

**Changes**: Column B (`name`) is now explicitly updatable via `renameProduct()`. No schema change needed — the column already exists and supports writes.

**Validation rules**:
- `name` MUST NOT be empty or whitespace-only after trimming
- `name` MUST be unique across all products (case-insensitive comparison)

### Variant (Sheet: "Variants") — EXISTING, NO CHANGE

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | string | Unique ID (format: `V###`) |
| B | productId | string | FK → Product.id |
| C | variantName | string | Variant display name |
| D | variantCode | string | SKU/model code |
| E | currentStock | number | Current stock quantity |
| F | createdAt | string (ISO 8601) | Creation timestamp |

**Note**: Variants reference products by `productId`, not by name. Renaming a product has zero impact on variants.

### AdjustmentHistory (Sheet: "AdjustmentHistory") — EXISTING, NO CHANGE

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | string | Unique ID (format: `A###`) |
| B | variantId | string | FK → Variant.id |
| C | adjustmentType | string | `"IMPORT"` or `"EXPORT"` |
| D | quantity | number | Positive integer, quantity adjusted |
| E | stockBefore | number | Stock before adjustment |
| F | stockAfter | number | Stock after adjustment |
| G | note | string | Optional note |
| H | createdAt | string (ISO 8601) | Adjustment timestamp |

**Note**: History references `variantId`, not product name. When building the global history view, the server joins: `AdjustmentHistory.variantId → Variant.productId → Product.name`.

## Relationships

```
Product (1) ──── (N) Variant (1) ──── (N) AdjustmentHistory
   │                    │                       │
   │ id ←──── productId │ id ←──── variantId    │
   │                    │                       │
   └── name (mutable)   └── variantName         └── adjustmentType, quantity, etc.
```

## Enriched History Record (API response only, not stored)

The `getAllAdjustmentHistory` endpoint returns enriched records by joining across sheets:

| Field | Source | Description |
|-------|--------|-------------|
| id | AdjustmentHistory.id | Record ID |
| variantId | AdjustmentHistory.variantId | Variant FK |
| variantName | Variant.variantName | Looked up from Variants sheet |
| productId | Variant.productId | Looked up from Variants sheet |
| productName | Product.name | Looked up from Products sheet |
| adjustmentType | AdjustmentHistory.adjustmentType | IMPORT or EXPORT |
| quantity | AdjustmentHistory.quantity | Amount adjusted |
| stockBefore | AdjustmentHistory.stockBefore | Stock before |
| stockAfter | AdjustmentHistory.stockAfter | Stock after |
| note | AdjustmentHistory.note | User note |
| createdAt | AdjustmentHistory.createdAt | Timestamp |

This enriched record is computed at API response time and is NOT persisted to any sheet.

## State Transitions

### Product Name

```
[Created with name] ──renameProduct()──→ [Updated name]
                     (repeatable)
```

- No state machine — rename is a simple field update.
- Rename does NOT create a new product or affect related data.

### Stock (unchanged from feature 001)

```
                   ┌─── adjustStock(IMPORT) ───→ stockAfter = stockBefore + quantity
currentStock ──────┤
                   └─── adjustStock(EXPORT) ───→ stockAfter = stockBefore - quantity
                        (requires stockBefore >= quantity)
```
