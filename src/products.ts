/**
 * Product & Variant CRUD operations.
 */

import { SHEET_NAMES, getAllRows, appendRow, findRowNumberById, generateId, updateRow } from "./sheets";
import { validateSession } from "./auth";

interface Variant {
  id: string;
  productId: string;
  variantName: string;
  variantCode: string;
  currentStock: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  createdAt: string;
  variants: Variant[];
}

interface ProductListResult {
  success: boolean;
  data?: Product[];
  error?: string;
}

interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

function authGuard(token: string): string | null {
  if (!validateSession(token)) return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
  return null;
}

function buildProductList(productRows: string[][], variantRows: string[][]): Product[] {
  const products: Product[] = productRows.map((r) => ({
    id: r[0],
    name: r[1],
    createdAt: r[2],
    variants: [],
  }));

  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  variantRows.forEach((r) => {
    const parent = productMap.get(r[1]);
    if (parent) {
      parent.variants.push({
        id: r[0],
        productId: r[1],
        variantName: r[2],
        variantCode: r[3],
        currentStock: Number(r[4]),
        createdAt: r[5],
      });
    }
  });

  return products;
}

function getProducts(token: string): ProductListResult {
  const err = authGuard(token);
  if (err) return { success: false, error: err };

  const productRows = getAllRows(SHEET_NAMES.PRODUCTS);
  const variantRows = getAllRows(SHEET_NAMES.VARIANTS);
  const data = buildProductList(productRows, variantRows);
  console.log(`getProducts: returned ${data.length} products`);
  return { success: true, data };
}

function searchProducts(token: string, query: string): ProductListResult {
  const err = authGuard(token);
  if (err) return { success: false, error: err };

  const q = query.toLowerCase();
  const productRows = getAllRows(SHEET_NAMES.PRODUCTS);
  const variantRows = getAllRows(SHEET_NAMES.VARIANTS);
  const all = buildProductList(productRows, variantRows);

  const filtered = all.filter((p) => {
    if (p.name.toLowerCase().includes(q)) return true;
    return p.variants.some(
      (v) => v.variantName.toLowerCase().includes(q) || v.variantCode.toLowerCase().includes(q),
    );
  });

  // For products matched by variant, keep only matching variants
  filtered.forEach((p) => {
    if (!p.name.toLowerCase().includes(q)) {
      p.variants = p.variants.filter(
        (v) => v.variantName.toLowerCase().includes(q) || v.variantCode.toLowerCase().includes(q),
      );
    }
  });

  console.log(`searchProducts: query="${query}" returned ${filtered.length} products`);
  return { success: true, data: filtered };
}

function createProduct(token: string, name: string): MutationResult {
  const err = authGuard(token);
  if (err) return { success: false, error: err };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Tên sản phẩm không được để trống." };

  // Check duplicate
  const existing = getAllRows(SHEET_NAMES.PRODUCTS);
  if (existing.some((r) => r[1].toLowerCase() === trimmed.toLowerCase())) {
    console.log(`createProduct: duplicate name="${trimmed}"`);
    return { success: false, error: "Sản phẩm đã tồn tại." };
  }

  const id = generateId(SHEET_NAMES.PRODUCTS, "P");
  const now = new Date().toISOString();
  appendRow(SHEET_NAMES.PRODUCTS, [id, trimmed, now]);
  console.log(`createProduct: success id=${id} name="${trimmed}"`);
  return { success: true, id };
}

function createVariant(
  token: string,
  productId: string,
  variantName: string,
  variantCode: string,
  initialStock: number,
): MutationResult {
  const err = authGuard(token);
  if (err) return { success: false, error: err };

  const trimName = variantName.trim();
  const trimCode = variantCode.trim();
  if (!trimName || !trimCode) return { success: false, error: "Tên và mã mẫu mã không được để trống." };
  if (isNaN(initialStock) || initialStock < 0) return { success: false, error: "Số lượng phải >= 0." };

  // Verify product exists
  if (findRowNumberById(SHEET_NAMES.PRODUCTS, productId) === -1) {
    return { success: false, error: "Sản phẩm không tồn tại." };
  }

  // Check duplicate variant within product
  const variants = getAllRows(SHEET_NAMES.VARIANTS);
  if (
    variants.some(
      (r) =>
        r[1] === productId &&
        r[2].toLowerCase() === trimName.toLowerCase() &&
        r[3].toLowerCase() === trimCode.toLowerCase(),
    )
  ) {
    console.log(`createVariant: duplicate name="${trimName}" code="${trimCode}" in product=${productId}`);
    return { success: false, error: "Mẫu mã đã tồn tại trong sản phẩm này." };
  }

  const id = generateId(SHEET_NAMES.VARIANTS, "V");
  const now = new Date().toISOString();
  appendRow(SHEET_NAMES.VARIANTS, [id, productId, trimName, trimCode, initialStock, now]);
  console.log(`createVariant: success id=${id} name="${trimName}" product=${productId}`);
  return { success: true, id };
}

function renameProduct(token: string, productId: string, newName: string): MutationResult {
  const err = authGuard(token);
  if (err) return { success: false, error: err };

  const trimmed = newName.trim();
  if (!trimmed) return { success: false, error: "Tên sản phẩm không được để trống." };

  const rowNum = findRowNumberById(SHEET_NAMES.PRODUCTS, productId);
  if (rowNum === -1) return { success: false, error: "Sản phẩm không tồn tại." };

  // Check duplicate (case-insensitive), excluding the current product
  const existing = getAllRows(SHEET_NAMES.PRODUCTS);
  if (existing.some((r) => r[0] !== productId && r[1].toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, error: "Sản phẩm đã tồn tại." };
  }

  // Get current row data to preserve other columns
  const sheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID")!,
  ).getSheetByName(SHEET_NAMES.PRODUCTS)!;
  const rowData = sheet.getRange(rowNum, 1, 1, 3).getValues()[0];
  const oldName = String(rowData[1]);

  updateRow(SHEET_NAMES.PRODUCTS, rowNum, [rowData[0], trimmed, rowData[2]]);
  console.log(`renameProduct: id=${productId} oldName="${oldName}" newName="${trimmed}"`);
  return { success: true };
}

export { getProducts, searchProducts, createProduct, createVariant, renameProduct };
