import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { AdminDashboardMetrics, AdminOrderListItem } from "@/types/admin";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";

const RECENT_ORDERS_LIMIT = 5;

export async function getDashboardMetrics(): Promise<AdminDashboardMetrics> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const [
    totalProductsResult,
    activeProductsResult,
    totalCategoriesResult,
    totalCustomersResult,
    totalOrdersResult,
    pendingOrdersResult,
    orderValueResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    // PostgREST's aggregate-function select syntax (e.g. total.sum()) is
    // disabled by default on Supabase projects (PGRST123) and enabling it
    // is a project-level dashboard setting outside this app's control, so
    // this sums a single narrow column in the app instead of in the
    // database. Still efficient relative to fetching full order rows (no
    // addresses, items, or customer data — just one integer per order) and
    // still RLS-scoped, but does not scale as well as a real aggregate
    // query at very high order volumes — see the Phase 10 README.
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(RECENT_ORDERS_LIMIT),
  ]);

  for (const result of [
    totalProductsResult,
    activeProductsResult,
    totalCategoriesResult,
    totalCustomersResult,
    totalOrdersResult,
    pendingOrdersResult,
    orderValueResult,
    recentOrdersResult,
  ]) {
    if (result.error) {
      console.error(
        "[dashboardService.getDashboardMetrics] failed:",
        result.error,
      );
      throw new Error("Unable to load dashboard metrics right now.");
    }
  }

  const totalOrderValue = (orderValueResult.data ?? []).reduce(
    (sum, row) => sum + row.total,
    0,
  );

  const recentOrders: AdminOrderListItem[] = (
    recentOrdersResult.data ?? []
  ).map((row): AdminOrderListItem => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.shipping_full_name,
    customerEmail: row.shipping_email,
    total: row.total,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    createdAt: row.created_at,
  }));

  return {
    totalProducts: totalProductsResult.count ?? 0,
    activeProducts: activeProductsResult.count ?? 0,
    totalCategories: totalCategoriesResult.count ?? 0,
    totalCustomers: totalCustomersResult.count ?? 0,
    totalOrders: totalOrdersResult.count ?? 0,
    pendingOrders: pendingOrdersResult.count ?? 0,
    totalOrderValue,
    recentOrders,
  };
}
