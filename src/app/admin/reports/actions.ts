"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { toCsv } from "@/lib/admin/csv";
import {
  getCurrentStockReport,
  getInventoryValueReport,
  getLowStockReport,
  getOutOfStockReport,
  getSalesReport,
  getStockMovementReport,
} from "@/lib/services/admin/reportService";
import { movementTypeLabel } from "@/lib/admin/movementTypes";
import type { MovementType, ReportType, StockReportRow } from "@/types/admin";

export interface ReportCsvFilters {
  categoryId?: string;
  supplierId?: string;
  productId?: string;
  movementType?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}

const STOCK_COLUMNS: {
  header: string;
  value: (row: StockReportRow) => string | number | null;
}[] = [
  { header: "Product", value: (row) => row.name },
  { header: "SKU", value: (row) => row.sku },
  { header: "Category", value: (row) => row.categoryName },
  { header: "Stock", value: (row) => row.stock },
  { header: "Min Stock Level", value: (row) => row.minStockLevel },
  { header: "Max Stock Level", value: (row) => row.maxStockLevel },
  { header: "Cost Price", value: (row) => row.costPrice },
  { header: "Selling Price", value: (row) => row.price },
  { header: "Stock Value", value: (row) => row.stockValue },
  { header: "Stock Status", value: (row) => row.stockStatus },
  { header: "Active", value: (row) => (row.isActive ? "Yes" : "No") },
  { header: "Force Unavailable", value: (row) => (row.forceUnavailable ? "Yes" : "No") },
];

function dateToEndOfDay(date: string | undefined): string | undefined {
  return date ? `${date}T23:59:59` : undefined;
}

export async function exportReportCsv(
  type: ReportType,
  filters: ReportCsvFilters,
): Promise<{ csv?: string; filename?: string; error?: string }> {
  await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);

  try {
    switch (type) {
      case "current-stock": {
        const rows = await getCurrentStockReport(filters);
        return {
          csv: toCsv(rows, STOCK_COLUMNS),
          filename: `current-stock-${today}.csv`,
        };
      }
      case "low-stock": {
        const rows = await getLowStockReport(filters);
        return { csv: toCsv(rows, STOCK_COLUMNS), filename: `low-stock-${today}.csv` };
      }
      case "out-of-stock": {
        const rows = await getOutOfStockReport(filters);
        return {
          csv: toCsv(rows, STOCK_COLUMNS),
          filename: `out-of-stock-${today}.csv`,
        };
      }
      case "inventory-value": {
        const rows = await getInventoryValueReport(filters);
        return {
          csv: toCsv(rows, STOCK_COLUMNS),
          filename: `inventory-value-${today}.csv`,
        };
      }
      case "movements": {
        const rows = await getStockMovementReport({
          productId: filters.productId,
          categoryId: filters.categoryId,
          movementType: filters.movementType,
          dateFrom: filters.dateFrom,
          dateTo: dateToEndOfDay(filters.dateTo),
        });
        return {
          csv: toCsv(rows, [
            { header: "Product", value: (row) => row.productName },
            { header: "SKU", value: (row) => row.sku },
            { header: "Movement Type", value: (row) => movementTypeLabel(row.movementType) },
            { header: "Quantity Change", value: (row) => row.quantityChange },
            { header: "Previous Quantity", value: (row) => row.previousQuantity },
            { header: "New Quantity", value: (row) => row.newQuantity },
            { header: "Reason", value: (row) => row.reason },
            { header: "Reference Number", value: (row) => row.referenceNumber },
            { header: "By", value: (row) => row.createdByEmail ?? "System" },
            { header: "Date", value: (row) => row.createdAt },
          ]),
          filename: `stock-movements-${today}.csv`,
        };
      }
      case "sales": {
        const rows = await getSalesReport({
          productId: filters.productId,
          categoryId: filters.categoryId,
          dateFrom: filters.dateFrom,
          dateTo: dateToEndOfDay(filters.dateTo),
        });
        return {
          csv: toCsv(rows, [
            { header: "Product", value: (row) => row.productName },
            { header: "SKU", value: (row) => row.sku },
            { header: "Category", value: (row) => row.categoryName },
            { header: "Quantity Sold", value: (row) => row.quantitySold },
            { header: "Revenue", value: (row) => row.revenue },
          ]),
          filename: `sales-${today}.csv`,
        };
      }
      default:
        return { error: "Unknown report type." };
    }
  } catch (error) {
    console.error("[reports.actions.exportReportCsv] failed:", error);
    return { error: "Unable to generate this report right now." };
  }
}
