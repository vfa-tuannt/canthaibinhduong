/**
 * Dashboard: Monthly aggregation queries.
 */

import { SHEET_NAMES, getAllRows } from "./sheets";
import { validateSession } from "./auth";

interface MonthlyData {
  month: number;
  totalImport: number;
  totalExport: number;
  adjustmentCount: number;
}

interface ProductSummary {
  productId: string;
  productName: string;
  totalStock: number;
  variantCount: number;
}

interface DashboardResult {
  success: boolean;
  monthly?: MonthlyData[];
  products?: ProductSummary[];
  error?: string;
}

function getDashboardData(token: string, year: number): DashboardResult {
  if (!validateSession(token)) {
    return { success: false, error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." };
  }

  const startTime = Date.now();

  // Monthly aggregation from AdjustmentHistory
  const historyRows = getAllRows(SHEET_NAMES.ADJUSTMENT_HISTORY);
  const monthlyMap = new Map<number, MonthlyData>();

  for (let m = 1; m <= 12; m++) {
    monthlyMap.set(m, { month: m, totalImport: 0, totalExport: 0, adjustmentCount: 0 });
  }

  historyRows.forEach((r) => {
    const createdAt = r[7]; // ISO string
    const date = new Date(createdAt);
    if (date.getFullYear() !== year) return;

    const month = date.getMonth() + 1;
    const entry = monthlyMap.get(month)!;
    const qty = Number(r[3]);
    const type = r[2]; // IMPORT | EXPORT

    if (type === "IMPORT") {
      entry.totalImport += qty;
    } else {
      entry.totalExport += qty;
    }
    entry.adjustmentCount++;
  });

  const monthly = Array.from(monthlyMap.values());

  // Product summaries
  const productRows = getAllRows(SHEET_NAMES.PRODUCTS);
  const variantRows = getAllRows(SHEET_NAMES.VARIANTS);

  const products: ProductSummary[] = productRows.map((p) => {
    const pId = p[0];
    const pName = p[1];
    const pVariants = variantRows.filter((v) => v[1] === pId);
    const totalStock = pVariants.reduce((sum, v) => sum + Number(v[4]), 0);
    return {
      productId: pId,
      productName: pName,
      totalStock,
      variantCount: pVariants.length,
    };
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `getDashboardData: year=${year} historyRows=${historyRows.length} products=${products.length} time=${elapsed}ms`,
  );

  return { success: true, monthly, products };
}

export { getDashboardData };
