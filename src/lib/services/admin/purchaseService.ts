import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminPurchaseDetail,
  AdminPurchaseFilters,
  AdminPurchaseInput,
  AdminPurchaseListItem,
  PaginationResult,
} from "@/types/admin";

const MAX_PURCHASE_NUMBER_ATTEMPTS = 20;

function generatePurchaseNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PO-${date}-${suffix}`;
}

function computeTotal(input: AdminPurchaseInput): number {
  return input.items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );
}

export async function listAdminPurchases(
  filters: AdminPurchaseFilters,
): Promise<PaginationResult<AdminPurchaseListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("purchases")
    .select("*, suppliers(name), purchase_items(id)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    query = query.ilike("purchase_number", `%${filters.search.trim()}%`);
  }
  if (filters.supplierId) query = query.eq("supplier_id", filters.supplierId);
  if (filters.status) query = query.eq("status", filters.status);

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[purchaseService.listAdminPurchases] failed:", error);
    throw new Error("Unable to load purchases right now.");
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    purchase_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    suppliers: { name: string } | null;
    purchase_items: { id: string }[];
  }[];

  const items: AdminPurchaseListItem[] = rows.map((row) => ({
    id: row.id,
    purchaseNumber: row.purchase_number,
    supplierName: row.suppliers?.name ?? "—",
    status: row.status as AdminPurchaseListItem["status"],
    paymentStatus: row.payment_status as AdminPurchaseListItem["paymentStatus"],
    totalAmount: row.total_amount,
    itemCount: row.purchase_items.length,
    createdAt: row.created_at,
  }));

  const totalCount = count ?? 0;
  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminPurchaseById(
  id: string,
): Promise<AdminPurchaseDetail | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("*, suppliers(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[purchaseService.getAdminPurchaseById] failed:", error);
    throw new Error("Unable to load this purchase right now.");
  }
  if (!data) return null;

  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("*")
    .eq("purchase_id", id)
    .order("created_at", { ascending: true });
  if (itemsError) throw itemsError;

  const supplierRow = data as unknown as { suppliers: { name: string } | null };

  return {
    id: data.id,
    purchaseNumber: data.purchase_number,
    supplierId: data.supplier_id,
    supplierName: supplierRow.suppliers?.name ?? "—",
    status: data.status as AdminPurchaseDetail["status"],
    paymentStatus: data.payment_status as AdminPurchaseDetail["paymentStatus"],
    totalAmount: data.total_amount,
    notes: data.notes ?? "",
    items: (items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id ?? "",
      variantId: item.variant_id,
      productName: item.product_name,
      sku: item.sku ?? "",
      quantity: item.quantity,
      costPrice: item.cost_price,
      lineTotal: item.line_total,
    })),
    createdAt: data.created_at,
  };
}

export async function createPurchase(
  input: AdminPurchaseInput,
): Promise<{ id?: string; error?: string }> {
  const { user } = await requireAdmin();

  if (input.items.length === 0) {
    return { error: "Add at least one item to this purchase." };
  }

  const supabase = await getSupabaseServerClient();
  const totalAmount = computeTotal(input);

  let purchaseId: string | undefined;
  for (let attempt = 0; attempt < MAX_PURCHASE_NUMBER_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from("purchases")
      .insert({
        purchase_number: generatePurchaseNumber(),
        supplier_id: input.supplierId,
        payment_status: input.paymentStatus,
        total_amount: totalAmount,
        notes: input.notes || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (!error) {
      purchaseId = data.id;
      break;
    }
    // 23505 = unique_violation, i.e. a purchase_number collision — retry
    // with a freshly generated number. Any other error is real and fatal.
    if (error.code !== "23505") {
      console.error("[purchaseService.createPurchase] failed:", error);
      return { error: "Unable to create this purchase right now." };
    }
  }

  if (!purchaseId) {
    return { error: "Could not generate a unique purchase number. Please try again." };
  }

  const { error: itemsError } = await supabase.from("purchase_items").insert(
    input.items.map((item) => ({
      purchase_id: purchaseId,
      product_id: item.productId || null,
      variant_id: item.variantId,
      product_name: item.productName,
      sku: item.sku || null,
      quantity: item.quantity,
      cost_price: item.costPrice,
      line_total: item.quantity * item.costPrice,
    })),
  );

  if (itemsError) {
    console.error(
      "[purchaseService.createPurchase] item insert failed:",
      itemsError,
    );
    // Best-effort cleanup so a failed purchase doesn't linger as an empty
    // draft with no items — not wrapped in a DB transaction since this is a
    // plain multi-statement client insert, not a SECURITY DEFINER function.
    await supabase.from("purchases").delete().eq("id", purchaseId);
    return {
      error: "Unable to save this purchase's items right now. Please try again.",
    };
  }

  return { id: purchaseId };
}

async function assertPurchaseIsPending(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { error: "Purchase not found." };
  if (data.status !== "pending") {
    return {
      error: "This purchase has already been completed or cancelled and can no longer be edited.",
    };
  }
  return {};
}

export async function updatePurchase(
  id: string,
  input: AdminPurchaseInput,
): Promise<{ error?: string }> {
  await requireAdmin();

  const pendingCheck = await assertPurchaseIsPending(id);
  if (pendingCheck.error) return pendingCheck;

  if (input.items.length === 0) {
    return { error: "Add at least one item to this purchase." };
  }

  const supabase = await getSupabaseServerClient();
  const totalAmount = computeTotal(input);

  const { error } = await supabase
    .from("purchases")
    .update({
      supplier_id: input.supplierId,
      payment_status: input.paymentStatus,
      total_amount: totalAmount,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (error) {
    console.error("[purchaseService.updatePurchase] failed:", error);
    return { error: "Unable to update this purchase right now." };
  }

  const { error: deleteError } = await supabase
    .from("purchase_items")
    .delete()
    .eq("purchase_id", id);
  if (deleteError) throw deleteError;

  const { error: itemsError } = await supabase.from("purchase_items").insert(
    input.items.map((item) => ({
      purchase_id: id,
      product_id: item.productId || null,
      variant_id: item.variantId,
      product_name: item.productName,
      sku: item.sku || null,
      quantity: item.quantity,
      cost_price: item.costPrice,
      line_total: item.quantity * item.costPrice,
    })),
  );

  if (itemsError) {
    console.error(
      "[purchaseService.updatePurchase] item insert failed:",
      itemsError,
    );
    return {
      error: "Purchase details saved, but its items couldn't be updated. Please try again.",
    };
  }
  return {};
}

export async function deletePurchase(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const pendingCheck = await assertPurchaseIsPending(id);
  if (pendingCheck.error) return pendingCheck;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) {
    console.error("[purchaseService.deletePurchase] failed:", error);
    return { error: "Unable to delete this purchase right now." };
  }
  return {};
}

/**
 * Marks a purchase received: bumps stock for every line item and writes an
 * inventory_movements row per item, atomically, via the complete_purchase()
 * SECURITY DEFINER function — never a sequence of client-side writes.
 */
export async function completePurchase(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.rpc("complete_purchase", {
    p_purchase_id: id,
  });

  if (error) {
    console.error("[purchaseService.completePurchase] failed:", error);
    if (error.code === "P0001" || error.code === "P0002") {
      return { error: error.message };
    }
    return { error: "Unable to complete this purchase right now." };
  }
  return {};
}
