/**
 * Google Sheets data-access helpers.
 * Each "table" is a named sheet in the active spreadsheet with row 1 as headers.
 */

const SHEET_NAMES = {
  PRODUCTS: "Products",
  VARIANTS: "Variants",
  ADJUSTMENT_HISTORY: "AdjustmentHistory",
} as const;

type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES];

/** Headers for each sheet (must match data-model.md column order). */
const HEADERS: Record<SheetName, string[]> = {
  [SHEET_NAMES.PRODUCTS]: ["id", "name", "createdAt"],
  [SHEET_NAMES.VARIANTS]: ["id", "productId", "variantName", "variantCode", "currentStock", "createdAt"],
  [SHEET_NAMES.ADJUSTMENT_HISTORY]: [
    "id",
    "variantId",
    "adjustmentType",
    "quantity",
    "stockBefore",
    "stockAfter",
    "note",
    "createdAt",
  ],
};

/**
 * Return the sheet with the given name, creating it (with headers) if it does
 * not yet exist.
 */
function getOrCreateSheet(name: SheetName): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const headers = HEADERS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log(`Created sheet "${name}" with headers: ${headers.join(", ")}`);
  }
  return sheet;
}

/**
 * Return all data rows (excluding header row) as a 2-D array.
 * Each inner array has the same column order as the sheet headers.
 */
function getAllRows(name: SheetName): string[][] {
  const sheet = getOrCreateSheet(name);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const lastCol = sheet.getLastColumn();
  return sheet
    .getRange(2, 1, lastRow - 1, lastCol)
    .getValues()
    .map((row) => row.map((cell) => String(cell)));
}

/**
 * Append a single row to the bottom of the sheet.
 */
function appendRow(name: SheetName, values: (string | number)[]): void {
  const sheet = getOrCreateSheet(name);
  sheet.appendRow(values);
  SpreadsheetApp.flush();
}

/**
 * Overwrite a row identified by its 1-based row number (2 = first data row).
 */
function updateRow(name: SheetName, rowNumber: number, values: (string | number)[]): void {
  const sheet = getOrCreateSheet(name);
  sheet.getRange(rowNumber, 1, 1, values.length).setValues([values]);
  SpreadsheetApp.flush();
}

/**
 * Find the 1-based row number whose column A matches `id`.
 * Returns -1 if not found.
 */
function findRowNumberById(name: SheetName, id: string): number {
  const sheet = getOrCreateSheet(name);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  const ids = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .map((r) => String(r[0]));
  const idx = ids.indexOf(id);
  return idx === -1 ? -1 : idx + 2; // +2 because row 1 = header, array is 0-based
}

/**
 * Generate a sequential ID with the given prefix.
 * E.g. generateId("P") → "P001", "P002", …
 */
function generateId(name: SheetName, prefix: string): string {
  const sheet = getOrCreateSheet(name);
  const lastRow = sheet.getLastRow();
  const nextNum = lastRow; // row 1 = header, so lastRow == count of data rows + 1
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

export { SHEET_NAMES, getAllRows, appendRow, updateRow, findRowNumberById, generateId, getOrCreateSheet };
