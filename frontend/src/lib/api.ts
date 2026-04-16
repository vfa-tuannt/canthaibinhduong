const API_URL =
  "https://script.google.com/macros/s/AKfycbwMKh7BdNNl71XFwFu5FFLqEqKknCJMr9E0okBwRwpORYwzS6q3_DgyGszMewcv-2Ul/exec";

interface APIRequest {
  action: string;
  params: Record<string, unknown>;
}

// --- Response types ---

export interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface Variant {
  id: string;
  productId: string;
  variantName: string;
  variantCode: string;
  currentStock: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  createdAt: string;
  variants: Variant[];
}

export interface ProductListResult {
  success: boolean;
  data?: Product[];
  error?: string;
}

export interface AdjustmentRecord {
  id: string;
  variantId: string;
  adjustmentType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string;
  createdAt: string;
}

export interface HistoryResult {
  success: boolean;
  data?: AdjustmentRecord[];
  error?: string;
}

export interface AdjustmentResult {
  success: boolean;
  stockBefore?: number;
  stockAfter?: number;
  error?: string;
}

export interface MonthlyData {
  month: number;
  totalImport: number;
  totalExport: number;
  adjustmentCount: number;
}

export interface ProductSummary {
  productId: string;
  productName: string;
  totalStock: number;
  variantCount: number;
}

export interface DashboardResult {
  success: boolean;
  monthly?: MonthlyData[];
  products?: ProductSummary[];
  error?: string;
}

export interface EnrichedAdjustmentRecord {
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

export interface GlobalHistoryResult {
  success: boolean;
  data?: EnrichedAdjustmentRecord[];
  error?: string;
}

// --- API call helper ---

async function callApi<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const body: APIRequest = { action, params };
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body),
    redirect: "follow",
  });
  return response.json() as Promise<T>;
}

// --- API functions ---

export function login(username: string, password: string): Promise<LoginResult> {
  return callApi<LoginResult>("login", { username, password });
}

export function validateSession(token: string): Promise<{ valid: boolean }> {
  return callApi<{ valid: boolean }>("validateSession", { token });
}

export function logoutApi(token: string): Promise<{ success: boolean }> {
  return callApi<{ success: boolean }>("logout", { token });
}

export function getProducts(token: string): Promise<ProductListResult> {
  return callApi<ProductListResult>("getProducts", { token });
}

export function searchProducts(token: string, query: string): Promise<ProductListResult> {
  return callApi<ProductListResult>("searchProducts", { token, query });
}

export function createProduct(token: string, name: string): Promise<MutationResult> {
  return callApi<MutationResult>("createProduct", { token, name });
}

export function createVariant(
  token: string,
  productId: string,
  variantName: string,
  variantCode: string,
  initialStock: number,
): Promise<MutationResult> {
  return callApi<MutationResult>("createVariant", { token, productId, variantName, variantCode, initialStock });
}

export function adjustStock(
  token: string,
  variantId: string,
  type: string,
  quantity: number,
  note: string,
): Promise<AdjustmentResult> {
  return callApi<AdjustmentResult>("adjustStock", { token, variantId, type, quantity, note });
}

export function getAdjustmentHistory(token: string, variantId: string): Promise<HistoryResult> {
  return callApi<HistoryResult>("getAdjustmentHistory", { token, variantId });
}

export function getDashboardData(token: string, year: number): Promise<DashboardResult> {
  return callApi<DashboardResult>("getDashboardData", { token, year });
}

export function renameProduct(token: string, productId: string, newName: string): Promise<MutationResult> {
  return callApi<MutationResult>("renameProduct", { token, productId, newName });
}

export function getAllAdjustmentHistory(token: string): Promise<GlobalHistoryResult> {
  return callApi<GlobalHistoryResult>("getAllAdjustmentHistory", { token });
}
