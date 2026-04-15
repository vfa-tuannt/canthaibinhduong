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

// --- JSON API entry point (for GitHub Pages frontend) ---

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, params } = body;

    let result: unknown;

    switch (action) {
      case "login":
        result = login(params.username, params.password);
        break;
      case "validateSession":
        result = { valid: validateSession(params.token) };
        break;
      case "logout":
        logout(params.token);
        result = { success: true };
        break;
      case "getProducts":
        result = getProducts(params.token);
        break;
      case "searchProducts":
        result = searchProducts(params.token, params.query);
        break;
      case "createProduct":
        result = createProduct(params.token, params.name);
        break;
      case "createVariant":
        result = createVariant(
          params.token,
          params.productId,
          params.variantName,
          params.variantCode,
          params.initialStock,
        );
        break;
      case "adjustStock":
        result = adjustStock(params.token, params.variantId, params.type, params.quantity, params.note);
        break;
      case "getAdjustmentHistory":
        result = getAdjustmentHistory(params.token, params.variantId);
        break;
      case "getDashboardData":
        result = getDashboardData(params.token, params.year);
        break;
      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: errorMsg }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
  doPost,
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
