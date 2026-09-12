import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminInventoryMovementListItem,
  MovementType,
  SalesReportFilters,
  SalesReportRow,
  StockMovementReportFilters,
  StockReportFilters,
  StockReportRow,
} from "@/types/admin";

// Caps on unbounded report queries — generous enough for this catalog's
// scale, but a report export should never be able to pull an unlimited
// number of rows in one request.
const MOVEMENT_REPORT_LIMIT = 5000;
const SALES_REPORT_ORDER_ITEMS_LIMIT = 20000;

interface StockQueryRow {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  min_stock_level: number;
  max_stock_level: number | null;
  cost_price: number | null;
  price: number;
  is_active: boolean;
  force_unavailable: boolean;
  categories: { name: string } | null;
}

function stockStatusOf(stock: number, minStockLevel: number): StockReportRow["stockStatus"] {
  if (stock === 0) return "out-of-stock";
  if (stock <= minStockLevel) return "low-stock";
  return "in-stock";
}

function mapStockRow(row: StockQueryRow): StockReportRow {
  return {
    productId: row.id,
    name: row.name,
    sku: row.sku,
    categoryName: row.categories?.name ?? "—",
    stock: row.stock,
    minStockLevel: row.min_stock_level,
    maxStockLevel: row.max_stock_level,
    costPrice: row.cost_price,
    price: row.price,
    stockValue: row.cost_price !== null ? row.cost_price * row.stock : null,
    stockStatus: stockStatusOf(row.stock, row.min_stock_level),
    isActive: row.is_active,
    forceUnavailable: row.force_unavailable,
  };
}

/**
 * Full product list with stock/value/status computed per row. Backs the
 * Current Stock, Low Stock, Out of Stock, and Inventory Value reports —
 * those are simply filtered views of this same underlying query, so every
 * one of them uses each product's own min_stock_level rather than a single
 * global threshold.
 */
export async function getCurrentStockReport(
  filters: StockReportFilters,
): Promise<StockReportRow[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, sku, stock, min_stock_level, max_stock_level, cost_price, price, is_active, force_unavailable, categories(name)",
    )
    .order("name", { ascending: true });

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.supplierId) query = query.eq("primary_supplier_id", filters.supplierId);

  const { data, error } = await query;
  if (error) {
    console.error("[reportService.getCurrentStockReport] failed:", error);
    throw new Error("Unable to load the current stock report right now.");
  }

  return (data as unknown as StockQueryRow[]).map(mapStockRow);
}

export async function getLowStockReport(
  filters: StockReportFilters,
): Promise<StockReportRow[]> {
  const rows = await getCurrentStockReport(filters);
  return rows
    .filter((row) => row.stockStatus === "low-stock")
    .sort((a, b) => a.stock - b.stock);
}

export async function getOutOfStockReport(
  filters: StockReportFilters,
): Promise<StockReportRow[]> {
  const rows = await getCurrentStockReport(filters);
  return rows.filter((row) => row.stockStatus === "out-of-stock");
}

/** Same rows as the current stock report, minus products with no cost price set. */
export async function getInventoryValueReport(
  filters: StockReportFilters,
): Promise<StockReportRow[]> {
  const rows = await getCurrentStockReport(filters);
  return rows
    .filter((row) => row.stockValue !== null)
    .sort((a, b) => (b.stockValue ?? 0) - (a.stockValue ?? 0));
}

interface MovementQueryRow {
  id: string;
  product_id: string | null;
  sku: string | null;
  movement_type: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_number: string | null;
  created_at: string;
  products: { name: string; category_id: string } | null;
  profiles: { email: string | null } | null;
}

function mapMovementRow(row: MovementQueryRow): AdminInventoryMovementListItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? null,
    sku: row.sku,
    movementType: row.movement_type as MovementType,
    quantityChange: row.quantity_change,
    previousQuantity: row.previous_quantity,
    newQuantity: row.new_quantity,
    reason: row.reason,
    referenceNumber: row.reference_number,
    createdByEmail: row.profiles?.email ?? null,
    createdAt: row.created_at,
  };
}

/**
 * Unpaginated movement history for the Stock Movement report/export, capped
 * at MOVEMENT_REPORT_LIMIT rows (most recent first) so a report request
 * can't pull an unbounded result set.
 */
export async function getStockMovementReport(
  filters: StockMovementReportFilters,
): Promise<AdminInventoryMovementListItem[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const productEmbed = filters.categoryId
    ? "products!inner(name, category_id)"
    : "products(name, category_id)";

  let query = supabase
    .from("inventory_movements")
    .select(`*, ${productEmbed}, profiles(email)`)
    .order("created_at", { ascending: false })
    .limit(MOVEMENT_REPORT_LIMIT);

  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.categoryId) query = query.eq("products.category_id", filters.categoryId);
  if (filters.movementType) query = query.eq("movement_type", filters.movementType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) {
    console.error("[reportService.getStockMovementReport] failed:", error);
    throw new Error("Unable to load the stock movement report right now.");
  }

  return (data ?? []).map((row) => mapMovementRow(row as unknown as MovementQueryRow));
}

interface SalesOrderItemRow {
  product_id: string | null;
  product_name: string;
  quantity: number;
  line_total: number;
  orders: { status: string; created_at: string } | null;
  products: { sku: string | null; category_id: string; categories: { name: string } | null } | null;
}

/**
 * Units sold and revenue per product, aggregated in JS from order_items —
 * PostgREST aggregate functions (.sum()) are disabled on this project, the
 * same tradeoff as the dashboard metrics. Cancelled orders are excluded
 * since they were never fulfilled from stock.
 */
export async function getSalesReport(
  filters: SalesReportFilters,
): Promise<SalesReportRow[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const productEmbed = filters.categoryId
    ? "products!inner(sku, category_id, categories(name))"
    : "products(sku, category_id, categories(name))";

  let query = supabase
    .from("order_items")
    .select(`product_id, product_name, quantity, line_total, orders!inner(status, created_at), ${productEmbed}`)
    .order("created_at", { ascending: false })
    .limit(SALES_REPORT_ORDER_ITEMS_LIMIT);

  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.categoryId) query = query.eq("products.category_id", filters.categoryId);
  if (filters.dateFrom) query = query.gte("orders.created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("orders.created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) {
    console.error("[reportService.getSalesReport] failed:", error);
    throw new Error("Unable to load the sales report right now.");
  }

  const rows = (data ?? []) as unknown as SalesOrderItemRow[];
  const byProduct = new Map<string, SalesReportRow>();

  for (const row of rows) {
    if (row.orders?.status === "cancelled") continue;
    const key = row.product_id ?? row.product_name;
    const existing = byProduct.get(key);
    if (existing) {
      existing.quantitySold += row.quantity;
      existing.revenue += row.line_total;
    } else {
      byProduct.set(key, {
        productId: row.product_id,
        productName: row.product_name,
        sku: row.products?.sku ?? null,
        categoryName: row.products?.categories?.name ?? "—",
        quantitySold: row.quantity,
        revenue: row.line_total,
      });
    }
  }

  return Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue);
}
