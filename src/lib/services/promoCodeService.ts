import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getSupabasePublicClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { PromoValidationResult } from "@/types/promoCode";

export interface ValidatePromoCodeInput {
  code: string;
  subtotal: number;
  email?: string;
}

/**
 * Preview-only: calls the validate_promo_code() SECURITY DEFINER RPC, which
 * never writes anything (no usage_count increment, no promo_code_usages
 * row). This powers the checkout "Apply" button's instant feedback; the
 * actual, authoritative discount is always recalculated from scratch inside
 * create_order() at order placement — see orderService.createOrder().
 */
export async function validatePromoCode(
  input: ValidatePromoCodeInput,
): Promise<PromoValidationResult> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("validate_promo_code", {
    p_code: input.code,
    p_subtotal: input.subtotal,
    p_email: input.email || null,
  });

  if (error) {
    console.error("[promoCodeService.validatePromoCode] RPC failed:", error);
    return {
      valid: false,
      error: "We couldn't check this promo code right now. Please try again.",
    };
  }

  const result = data as unknown as {
    valid: boolean;
    error?: string;
    code?: string;
    discount_type?: "percentage" | "fixed";
    discount_value?: number;
    discount_amount?: number;
  };

  return {
    valid: result.valid,
    error: result.error,
    code: result.code,
    discountType: result.discount_type,
    discountValue: result.discount_value,
    discountAmount: result.discount_amount,
  };
}

// Read on every checkout page load, so this follows the same cached + tagged
// pattern as settingsService.getSiteSetting / promoBannerService — an admin
// create/update/activate/delete calls revalidateTag(CACHE_TAGS.activePromoCode)
// so a change shows up immediately instead of waiting out the window below.
const hasActivePromoCodeUncached = unstable_cache(
  async (): Promise<boolean> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase.rpc("has_active_promo_code");
    if (error) throw error;
    return Boolean(data);
  },
  ["promo-codes:has-active"],
  { tags: [CACHE_TAGS.activePromoCode], revalidate: 300 },
);

/**
 * Whether at least one promo code is currently redeemable (active, within
 * its start/expiry window, under its usage limit) — used to hide the
 * checkout "Have a promo code?" field entirely when no campaign is running,
 * instead of showing an Apply box that could only ever say "invalid code".
 */
export async function hasActivePromoCode(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    return await hasActivePromoCodeUncached();
  } catch (error) {
    console.error(
      "[promoCodeService.hasActivePromoCode] Supabase query failed:",
      error,
    );
    return false;
  }
}
