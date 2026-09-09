import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { mapOrderRow } from "@/lib/supabase/mappers";
import type { AdminOrderFilters, AdminOrderListItem } from "@/types/admin";
import type { PaginationResult } from "@/types/admin";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import type { Database } from "@/types/supabase";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function toAdminOrderListItem(row: OrderRow): AdminOrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.shipping_full_name,
    customerEmail: row.shipping_email,
    total: row.total,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    createdAt: row.created_at,
  };
}

export async function listAdminOrders(
  filters: AdminOrderFilters,
): Promise<PaginationResult<AdminOrderListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `order_number.ilike.%${term}%,shipping_full_name.ilike.%${term}%,shipping_email.ilike.%${term}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }
  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  query = query.order("created_at", { ascending: false });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[adminOrderService.listAdminOrders] failed:", error);
    throw new Error("Unable to load orders right now.");
  }

  const totalCount = count ?? 0;
  return {
    items: (data ?? []).map(toAdminOrderListItem),
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    console.error("[adminOrderService.getAdminOrderById] failed:", orderError);
    throw new Error("Unable to load this order right now.");
  }
  if (!orderRow) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderRow.id);

  if (itemsError) {
    console.error("[adminOrderService.getAdminOrderById] failed:", itemsError);
    throw new Error("Unable to load this order right now.");
  }

  return mapOrderRow(orderRow, itemRows ?? []);
}

export async function updateOrderStatus(
  id: string,
  input: { status?: string; paymentStatus?: string },
): Promise<{ error?: string }> {
  await requireAdmin();

  const updates: { status?: OrderStatus; payment_status?: PaymentStatus } = {};
  if (input.status !== undefined) {
    if (!ORDER_STATUSES.includes(input.status as OrderStatus)) {
      return { error: "Invalid order status." };
    }
    updates.status = input.status as OrderStatus;
  }
  if (input.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(input.paymentStatus as PaymentStatus)) {
      return { error: "Invalid payment status." };
    }
    updates.payment_status = input.paymentStatus as PaymentStatus;
  }
  if (Object.keys(updates).length === 0) return {};

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("orders").update(updates).eq("id", id);

  if (error) {
    console.error("[adminOrderService.updateOrderStatus] failed:", error);
    return { error: "Unable to update this order right now." };
  }
  return {};
}
