# Data Model: Inventory Management System

**Feature**: 001-inventory-management  
**Date**: 2026-04-15  
**Storage**: Google Sheets (each sheet = one table)

## Entities

### 1. Products (Sheet: `Products`)

Represents a product category (e.g., CÂN GS, CÂN CAS, CÂN TIỂU LY).

| Column | Field | Type | Constraints | Description |
|--------|-------|------|-------------|-------------|
| A | id | string | PK, unique, auto-generated | UUID or sequential ID (e.g., `P001`) |
| B | name | string | required, unique | Product name (e.g., "CÂN GS") |
| C | createdAt | string (ISO 8601) | auto-set on create | Timestamp of creation |

**Validation rules**:
- `name` must be non-empty and unique across all products.
- `id` is generated server-side, never user-supplied.

---

### 2. Variants (Sheet: `Variants`)

Represents a specific variant/SKU of a product (e.g., "CÂN GS /2203A / MOI" with spec "220G/-0,001G").

| Column | Field | Type | Constraints | Description |
|--------|-------|------|-------------|-------------|
| A | id | string | PK, unique, auto-generated | UUID or sequential ID (e.g., `V001`) |
| B | productId | string | FK → Products.id, required | Parent product reference |
| C | variantName | string | required | Variant display name (e.g., "CÂN GS /2203A / MOI") |
| D | variantCode | string | required | Variant code/spec (e.g., "220G/-0,001G") |
| E | currentStock | number | >= 0, default 0 | Current inventory quantity |
| F | createdAt | string (ISO 8601) | auto-set on create | Timestamp of creation |

**Validation rules**:
- `productId` must reference an existing Products.id.
- `variantName` + `variantCode` combination should be unique within a product.
- `currentStock` must never be negative (enforced on adjustment).

**Relationships**:
- Many-to-one with Products (many variants belong to one product).

---

### 3. AdjustmentHistory (Sheet: `AdjustmentHistory`)

Records every stock adjustment for audit trail.

| Column | Field | Type | Constraints | Description |
|--------|-------|------|-------------|-------------|
| A | id | string | PK, unique, auto-generated | UUID or sequential ID (e.g., `A001`) |
| B | variantId | string | FK → Variants.id, required | Which variant was adjusted |
| C | adjustmentType | string | enum: "IMPORT" \| "EXPORT" | Type of adjustment |
| D | quantity | number | > 0, required | Quantity changed (always positive) |
| E | stockBefore | number | >= 0 | Stock level before adjustment |
| F | stockAfter | number | >= 0 | Stock level after adjustment |
| G | note | string | optional | User-provided note for this adjustment |
| H | createdAt | string (ISO 8601) | auto-set on create | Timestamp of adjustment |

**Validation rules**:
- `quantity` must be a positive integer.
- For EXPORT: `stockBefore - quantity >= 0` (cannot go negative).
- `stockAfter` = `stockBefore + quantity` (IMPORT) or `stockBefore - quantity` (EXPORT).
- `variantId` must reference an existing Variants.id.

**Relationships**:
- Many-to-one with Variants (many adjustments belong to one variant).

---

### 4. Session (ScriptProperties — not a Sheet)

User session state stored in `PropertiesService.getScriptProperties()` with key prefix `SESSION_`.

| Key | Type | TTL | Description |
|-----|------|-----|-------------|
| `SESSION_{token}` | JSON string | 7 days | `{username, expiresAt}` — token generated on successful login |

**Notes**:
- Not persisted in Sheets — stored in ScriptProperties for reliability (unlike CacheService which can evict entries early).
- Token also stored in client-side `localStorage` for session persistence across page reloads.
- Validated on every server-side function call by checking existence and expiry timestamp.
- Credentials (username/password) stored separately in `PropertiesService.getScriptProperties()`.

## Entity Relationship Diagram

```
Products (1) ──────< (N) Variants (1) ──────< (N) AdjustmentHistory
   │                       │                          │
   ├─ id (PK)              ├─ id (PK)                 ├─ id (PK)
   ├─ name                 ├─ productId (FK)           ├─ variantId (FK)
   └─ createdAt            ├─ variantName              ├─ adjustmentType
                           ├─ variantCode              ├─ quantity
                           ├─ currentStock             ├─ stockBefore
                           └─ createdAt                ├─ stockAfter
                                                       ├─ note
                                                       └─ createdAt
```

## State Transitions

### Variant Stock

```
[Any stock level N >= 0]
    ── IMPORT(qty) ──→ [N + qty]
    ── EXPORT(qty) ──→ [N - qty]  (only if N >= qty)
```

### User Session

```
[Unauthenticated]
    ── login(user, pass) ──→ [Authenticated] (token in ScriptProperties, 7-day TTL + localStorage)
    
[Authenticated]
    ── logout / TTL expires ──→ [Unauthenticated]
```

## Sheet Layout Example

### Products Sheet
```
| id   | name          | createdAt            |
|------|---------------|----------------------|
| P001 | CÂN GS        | 2026-04-15T10:00:00Z |
| P002 | CÂN CAS       | 2026-04-15T10:00:00Z |
| P003 | CÂN TIỂU LY   | 2026-04-15T10:00:00Z |
```

### Variants Sheet
```
| id   | productId | variantName              | variantCode       | currentStock | createdAt            |
|------|-----------|--------------------------|-------------------|--------------|----------------------|
| V001 | P001      | CÂN GS /2203A / MOI       | 220G/-0,001G      | 0            | 2026-04-15T10:00:00Z |
| V002 | P001      | CÂN GS /2202N             | 2200/0,01G        | 1            | 2026-04-15T10:00:00Z |
| V003 | P002      | VIBRA----SJ               | 6200G             | 0            | 2026-04-15T10:00:00Z |
```

### AdjustmentHistory Sheet
```
| id   | variantId | adjustmentType | quantity | stockBefore | stockAfter | note         | createdAt            |
|------|-----------|----------------|----------|-------------|------------|--------------|----------------------|
| A001 | V002      | IMPORT         | 2        | 0           | 2          | Nhập hàng T6 | 2026-06-03T08:00:00Z |
| A002 | V002      | EXPORT         | 1        | 2           | 1          | Bán hàng     | 2026-06-05T14:30:00Z |
```
