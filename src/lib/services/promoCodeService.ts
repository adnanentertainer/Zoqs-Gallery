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
  { tags: [CACHE_TAGS.activePromoCode], revalidate: 3600 },
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

export interface ActiveHeroImage {
  imageUrl: string;
  /** The code's description (e.g. "Eid-ul-Fitr sale") — used as the hero
   * photo's alt text so it stays meaningful instead of a bare code string. */
  imageAlt: string;
}

// Same cache tag as hasActivePromoCode — an admin create/update/delete
// already calls revalidateTag(CACHE_TAGS.activePromoCode) (see
// app/admin/promo-codes/actions.ts), so a newly uploaded hero image shows up
// on the homepage immediately instead of waiting out the window below.
const getActiveHeroImageUncached = unstable_cache(
  async (): Promise<ActiveHeroImage | null> => {
    const supabase = getSupabasePublicClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("description, hero_image_url")
      .eq("is_active", true)
      .not("hero_image_url", "is", null)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order("starts_at", { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data?.hero_image_url) return null;

    return {
      imageUrl: data.hero_image_url,
      imageAlt: data.description || "Current promotion",
    };
  },
  ["promo-codes:active-hero-image"],
  { tags: [CACHE_TAGS.activePromoCode], revalidate: 3600 },
);

/**
 * The live promo code's hero banner image, if any code currently running
 * has one uploaded — used to swap the homepage hero's default model photo
 * for a festive one while that code's window is open. Returns null outside
 * any code's window, or when the live code never had an image uploaded for
 * it (admin left the hero banner field empty on purpose).
 */
export async function getActiveHeroImage(): Promise<ActiveHeroImage | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    return await getActiveHeroImageUncached();
  } catch (error) {
    console.error(
      "[promoCodeService.getActiveHeroImage] Supabase query failed:",
      error,
    );
    return null;
  }
}
