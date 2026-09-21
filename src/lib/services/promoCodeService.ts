import { getSupabaseServerClient } from "@/lib/supabase/server";
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
