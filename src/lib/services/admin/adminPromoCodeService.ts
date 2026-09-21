import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminPromoCodeInput,
  AdminPromoCodeListItem,
  PromoCode,
} from "@/types/promoCode";
import type { PaginationResult } from "@/types/admin";
import type { Database } from "@/types/supabase";

type PromoCodeRow = Database["public"]["Tables"]["promo_codes"]["Row"];

export interface AdminPromoCodeFilters {
  search?: string;
  status?: "active" | "inactive";
  page: number;
  pageSize: number;
}

function toListItem(row: PromoCodeRow): AdminPromoCodeListItem {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type as AdminPromoCodeListItem["discountType"],
    discountValue: row.discount_value,
    minOrderAmount: row.min_order_amount,
    usageCount: row.usage_count,
    usageLimit: row.usage_limit,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function toPromoCode(row: PromoCodeRow): PromoCode {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type as PromoCode["discountType"],
    discountValue: row.discount_value,
    minOrderAmount: row.min_order_amount,
    maxDiscountAmount: row.max_discount_amount,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    usageLimit: row.usage_limit,
    usageLimitPerCustomer: row.usage_limit_per_customer,
    usageCount: row.usage_count,
    isActive: row.is_active,
    description: row.description ?? "",
    createdAt: row.created_at,
  };
}

export async function listAdminPromoCodes(
  filters: AdminPromoCodeFilters,
): Promise<PaginationResult<AdminPromoCodeListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase.from("promo_codes").select("*", { count: "exact" });

  if (filters.search?.trim()) {
    query = query.ilike("code", `%${filters.search.trim()}%`);
  }
  if (filters.status) {
    query = query.eq("is_active", filters.status === "active");
  }

  query = query.order("created_at", { ascending: false });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[adminPromoCodeService.listAdminPromoCodes] failed:", error);
    throw new Error("Unable to load promo codes right now.");
  }

  const totalCount = count ?? 0;
  return {
    items: (data ?? []).map(toListItem),
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminPromoCodeById(
  id: string,
): Promise<PromoCode | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminPromoCodeService.getAdminPromoCodeById] failed:", error);
    throw new Error("Unable to load this promo code right now.");
  }
  if (!data) return null;
  return toPromoCode(data);
}

async function isCodeTaken(code: string, excludeId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("promo_codes").select("id").eq("code", code);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data !== null;
}

function toRowPayload(input: AdminPromoCodeInput) {
  return {
    code: input.code.trim().toUpperCase(),
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_amount: input.minOrderAmount,
    max_discount_amount:
      input.discountType === "percentage" ? input.maxDiscountAmount : null,
    starts_at: input.startsAt,
    expires_at: input.expiresAt,
    usage_limit: input.usageLimit,
    usage_limit_per_customer: input.usageLimitPerCustomer,
    is_active: input.isActive,
    description: input.description.trim() || null,
  };
}

export async function createPromoCode(
  input: AdminPromoCodeInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();

  const code = input.code.trim().toUpperCase();
  if (await isCodeTaken(code)) {
    return { error: "A promo code with this code already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .insert(toRowPayload(input))
    .select("id")
    .single();

  if (error) {
    console.error("[adminPromoCodeService.createPromoCode] failed:", error);
    return { error: "Unable to create this promo code right now." };
  }
  return { id: data.id };
}

export async function updatePromoCode(
  id: string,
  input: AdminPromoCodeInput,
): Promise<{ error?: string }> {
  await requireAdmin();

  const code = input.code.trim().toUpperCase();
  if (await isCodeTaken(code, id)) {
    return { error: "A promo code with this code already exists." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("promo_codes")
    .update(toRowPayload(input))
    .eq("id", id);

  if (error) {
    console.error("[adminPromoCodeService.updatePromoCode] failed:", error);
    return { error: "Unable to update this promo code right now." };
  }
  return {};
}

export async function setPromoCodeActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[adminPromoCodeService.setPromoCodeActive] failed:", error);
    return { error: "Unable to update this promo code right now." };
  }
  return {};
}

export async function deletePromoCode(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // Safe to delete outright — orders that used this code already snapshot
  // their own promo_code/discount_type/discount_value/discount_amount, and
  // promotional_banners.promo_code_id is ON DELETE SET NULL, so nothing else
  // references this row in a way that would break.
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) {
    console.error("[adminPromoCodeService.deletePromoCode] failed:", error);
    return { error: "Unable to delete this promo code right now." };
  }
  return {};
}

/** For the "link a promo code" dropdown on the banner form. */
export async function listActivePromoCodesForSelect(): Promise<
  { id: string; code: string }[]
> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code")
    .order("code", { ascending: true });

  if (error) {
    console.error(
      "[adminPromoCodeService.listActivePromoCodesForSelect] failed:",
      error,
    );
    throw new Error("Unable to load promo codes right now.");
  }
  return data ?? [];
}
