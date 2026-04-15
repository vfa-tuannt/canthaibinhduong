// Entry point: All GAS-callable functions must be exported from this file.
// See: https://developers.google.com/apps-script/guides/triggers

import { login, validateSession, logout } from "./auth";
import { getProducts, searchProducts, createProduct, createVariant } from "./products";
import { adjustStock, getAdjustmentHistory } from "./inventory";
import { getDashboardData } from "./dashboard";

// --- Web App entry point ---

function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile("src/html/index")
    .evaluate()
    .setTitle("Quản lý tồn kho")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper for HTML includes (used in index.html templates)
function include(filename: string): string {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- Simple Triggers ---

function onOpen(
  e:
    | GoogleAppsScript.Events.DocsOnOpen
    | GoogleAppsScript.Events.SlidesOnOpen
    | GoogleAppsScript.Events.SheetsOnOpen
    | GoogleAppsScript.Events.FormsOnOpen,
): void {
  console.log(e);
}

export {
  doGet,
  include,
  onOpen,
  login,
  validateSession,
  logout,
  getProducts,
  searchProducts,
  createProduct,
  createVariant,
  adjustStock,
  getAdjustmentHistory,
  getDashboardData,
};
