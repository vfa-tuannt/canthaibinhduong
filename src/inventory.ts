/**
 * Stock adjustment logic + history recording.
 * Uses LockService for concurrency control.
 */

import { SHEET_NAMES, getAllRows, appendRow, updateRow, findRowNumberById, generateId, getOrCreateSheet } from "./sheets";
import { validateSession } from "./auth";

interface AdjustmentResult {
  success: boolean;
  stockBefore?: number;
  stockAfter?: number;
  error?: string;
}

interface AdjustmentRecord {
  id: string;
  variantId: string;
  adjustmentType: string;
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

interface EnrichedAdjustmentRecord {
  id: string;
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  adjustmentType: string;
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

function adjustStock(
  token: string,
  variantId: string,
  type: string,
  quantity: number,
  note: string,
): AdjustmentResult {
  if (!validateSession(token)) {
    return { success: false, error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." };
  }

  if (type !== "IMPORT" && type !== "EXPORT") {
    return { success: false, error: "Loại điều chỉnh không hợp lệ." };
  }

  if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    return { success: false, error: "Số lượng phải là số nguyên dương." };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch {
    console.error(`adjustStock: could not acquire lock for variant=${variantId}`);
    return { success: false, error: "Hệ thống đang bận. Vui lòng thử lại." };
  }

  try {
    const rowNum = findRowNumberById(SHEET_NAMES.VARIANTS, variantId);
    if (rowNum === -1) {
      return { success: false, error: "Mẫu mã không tồn tại." };
    }

    // Read the current variant row
    const sheet = getOrCreateSheet(SHEET_NAMES.VARIANTS);
    const rowData = sheet.getRange(rowNum, 1, 1, 6).getValues()[0];
    const stockBefore = Number(rowData[4]);

    let stockAfter: number;
    if (type === "IMPORT") {
      stockAfter = stockBefore + quantity;
    } else {
      if (stockBefore < quantity) {
        return {
          success: false,
          error: `Tồn kho không đủ. Hiện tại: ${stockBefore}, xuất: ${quantity}.`,
        };
      }
      stockAfter = stockBefore - quantity;
    }

    // Update variant stock
    const updatedRow = [rowData[0], rowData[1], rowData[2], rowData[3], stockAfter, rowData[5]];
    updateRow(SHEET_NAMES.VARIANTS, rowNum, updatedRow);

    // Record adjustment history
    const histId = generateId(SHEET_NAMES.ADJUSTMENT_HISTORY, "A");
    const now = new Date().toISOString();
    appendRow(SHEET_NAMES.ADJUSTMENT_HISTORY, [
      histId,
      variantId,
      type,
      quantity,
      stockBefore,
      stockAfter,
      note || "",
      now,
    ]);

    console.log(
      `adjustStock: variant=${variantId} type=${type} qty=${quantity} before=${stockBefore} after=${stockAfter}`,
    );
    return { success: true, stockBefore, stockAfter };
  } finally {
    lock.releaseLock();
  }
}

function getAdjustmentHistory(token: string, variantId: string): HistoryResult {
  if (!validateSession(token)) {
    return { success: false, error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." };
  }

  const rows = getAllRows(SHEET_NAMES.ADJUSTMENT_HISTORY);
  const filtered = rows
    .filter((r) => r[1] === variantId)
    .map((r) => ({
      id: r[0],
      variantId: r[1],
      adjustmentType: r[2],
      quantity: Number(r[3]),
      stockBefore: Number(r[4]),
      stockAfter: Number(r[5]),
      note: r[6],
      createdAt: r[7],
    }))
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  console.log(`getAdjustmentHistory: variant=${variantId} returned ${filtered.length} records`);
  return { success: true, data: filtered };
}

function getAllAdjustmentHistory(token: string): GlobalHistoryResult {
  if (!validateSession(token)) {
    return { success: false, error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." };
  }

  // Build lookup maps for variants and products
  const variantRows = getAllRows(SHEET_NAMES.VARIANTS);
  const variantMap = new Map<string, { variantName: string; productId: string }>();
  for (const v of variantRows) {
    variantMap.set(v[0], { variantName: v[2], productId: v[1] });
  }

  const productRows = getAllRows(SHEET_NAMES.PRODUCTS);
  const productMap = new Map<string, string>();
  for (const p of productRows) {
    productMap.set(p[0], p[1]);
  }

  const historyRows = getAllRows(SHEET_NAMES.ADJUSTMENT_HISTORY);
  const enriched: EnrichedAdjustmentRecord[] = historyRows
    .map((r) => {
      const variant = variantMap.get(r[1]);
      return {
        id: r[0],
        variantId: r[1],
        variantName: variant ? variant.variantName : "(Đã xóa)",
        productId: variant ? variant.productId : "",
        productName: variant ? (productMap.get(variant.productId) || "(Đã xóa)") : "(Đã xóa)",
        adjustmentType: r[2],
        quantity: Number(r[3]),
        stockBefore: Number(r[4]),
        stockAfter: Number(r[5]),
        note: r[6],
        createdAt: r[7],
      };
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, 5000);

  console.log(`getAllAdjustmentHistory: returned ${enriched.length} records`);
  return { success: true, data: enriched };
}

export { adjustStock, getAdjustmentHistory, getAllAdjustmentHistory };
