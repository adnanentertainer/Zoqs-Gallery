import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminInventoryDashboardMetrics,
  AdminInventoryMovementFilters,
  AdminInventoryMovementListItem,
  MovementType,
  PaginationResult,
  StockAdjustmentInput,
} from "@/types/admin";

const RECENT_MOVEMENTS_LIMIT = 10;

interface MovementRow {
  id: string;
  product_id: string | null;
  variant_id: string | null;
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

function mapMovementRow(row: MovementRow): AdminInventoryMovementListItem {
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

export async function listInventoryMovements(
  filters: AdminInventoryMovementFilters,
): Promise<PaginationResult<AdminInventoryMovementListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // Only inner-join products (rather than a plain left join) when filtering
  // by category, mirroring productService's categorySlug pattern — a plain
  // left join can't be filtered on a nested column via PostgREST.
  const productEmbed = filters.categoryId
    ? "products!inner(name, category_id)"
    : "products(name, category_id)";

  let query = supabase
    .from("inventory_movements")
    .select(`*, ${productEmbed}, profiles(email)`, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.productId) query = query.eq("product_id", filters.productId);
  if (filters.categoryId) {
    query = query.eq("products.category_id", filters.categoryId);
  }
  if (filters.movementType) query = query.eq("movement_type", filters.movementType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[inventoryService.listInventoryMovements] failed:", error);
    throw new Error("Unable to load inventory movements right now.");
  }

  const items = (data ?? []).map((row) =>
    mapMovementRow(row as unknown as MovementRow),
  );
  const totalCount = count ?? 0;
  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function recordStockMovement(
  input: StockAdjustmentInput,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { error: "Quantity must be a positive whole number." };
  }

  const quantityChange =
    input.direction === "increase" ? input.quantity : -input.quantity;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("record_stock_movement", {
    p_product_id: input.productId,
    p_variant_id: input.variantId,
    p_movement_type: input.movementType,
    p_quantity_change: quantityChange,
    p_reason: input.reason || null,
    p_reference_number: input.referenceNumber || null,
  });

  if (error) {
    console.error("[inventoryService.recordStockMovement] failed:", error);
    // P0001 is this function's own "would go negative" / not-found guard —
    // its message is already customer-safe to surface directly.
    if (error.code === "P0001" || error.code === "P0002") {
      return { error: error.message };
    }
    return { error: "Unable to record this stock movement right now." };
  }
  return {};
}

export async function getInventoryDashboardMetrics(): Promise<AdminInventoryDashboardMetrics> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const [productsResult, recentMovementsResult] = await Promise.all([
    // Narrow column selection, same "sum in JS" tradeoff as
    // dashboardService.getDashboardMetrics — PostgREST aggregate functions
    // are disabled on this project. stock/min_stock_level/cost_price
    // comparisons are per-row (stock vs. that same row's min_stock_level),
    // which PostgREST filters can't express against another column anyway.
    supabase.from("products").select("stock, min_stock_level, cost_price"),
    supabase
      .from("inventory_movements")
      .select("*, products(name, category_id), profiles(email)")
      .order("created_at", { ascending: false })
      .limit(RECENT_MOVEMENTS_LIMIT),
  ]);

  if (productsResult.error) {
    console.error(
      "[inventoryService.getInventoryDashboardMetrics] products query failed:",
      productsResult.error,
    );
    throw new Error("Unable to load inventory metrics right now.");
  }
  if (recentMovementsResult.error) {
    console.error(
      "[inventoryService.getInventoryDashboardMetrics] movements query failed:",
      recentMovementsResult.error,
    );
    throw new Error("Unable to load inventory metrics right now.");
  }

  const products = productsResult.data ?? [];
  let totalStockQuantity = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValue = 0;

  for (const product of products) {
    totalStockQuantity += product.stock;
    if (product.stock === 0) {
      outOfStockCount += 1;
    } else if (product.stock <= product.min_stock_level) {
      lowStockCount += 1;
    }
    if (product.cost_price !== null) {
      totalInventoryValue += product.cost_price * product.stock;
    }
  }

  return {
    totalProducts: products.length,
    totalStockQuantity,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue,
    recentMovements: (recentMovementsResult.data ?? []).map((row) =>
      mapMovementRow(row as unknown as MovementRow),
    ),
  };
}
