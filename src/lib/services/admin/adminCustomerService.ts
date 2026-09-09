import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminCustomerFilters,
  AdminCustomerListItem,
  AdminOrderListItem,
  PaginationResult,
} from "@/types/admin";
import type { UserRole } from "@/types";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toAdminCustomerListItem(row: ProfileRow): AdminCustomerListItem {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role === "admin" ? "admin" : "customer",
    createdAt: row.created_at,
  };
}

/**
 * Order count per customer is intentionally omitted from the list — with
 * plain PostgREST there's no single-query way to get a per-row related
 * count without an N+1 query per page of results, which isn't "efficient"
 * per the Phase 10 spec's own qualifier. It's shown on the customer detail
 * page instead, where one extra query for one customer is genuinely cheap.
 */
export async function listAdminCustomers(
  filters: AdminCustomerFilters,
): Promise<PaginationResult<AdminCustomerListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase.from("profiles").select("*", { count: "exact" });

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
    );
  }

  query = query.order("created_at", { ascending: false });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[adminCustomerService.listAdminCustomers] failed:", error);
    throw new Error("Unable to load customers right now.");
  }

  const totalCount = count ?? 0;
  return {
    items: (data ?? []).map(toAdminCustomerListItem),
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export interface AdminCustomerDetail {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  recentOrders: AdminOrderListItem[];
}

export async function getAdminCustomerById(
  id: string,
): Promise<AdminCustomerDetail | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminCustomerService.getAdminCustomerById] failed:", error);
    throw new Error("Unable to load this customer right now.");
  }
  if (!profile) return null;

  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error(
      "[adminCustomerService.getAdminCustomerById] orders failed:",
      ordersError,
    );
    throw new Error("Unable to load this customer's orders right now.");
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role === "admin" ? "admin" : "customer",
    createdAt: profile.created_at,
    recentOrders: (orderRows ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.shipping_full_name,
      customerEmail: row.shipping_email,
      total: row.total,
      status: row.status as AdminOrderListItem["status"],
      paymentStatus: row.payment_status as AdminOrderListItem["paymentStatus"],
      paymentMethod: row.payment_method as AdminOrderListItem["paymentMethod"],
      createdAt: row.created_at,
    })),
  };
}
