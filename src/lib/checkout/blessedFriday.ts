import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";

/**
 * Client-facing preview only — create_order() independently recomputes this
 * from site_settings at order time and is the sole authority over what's
 * actually charged (same trust boundary as calculateShippingCost/promo
 * codes). Mirrors create_order()'s own rounding (floor) exactly so the
 * checkout preview never shows a different amount than what gets charged.
 */
export function calculateBlessedFridayDiscount(
  subtotal: number,
  offer: BlessedFridayOffer,
): number {
  if (!offer.enabled || subtotal < offer.minSpend) return 0;
  return Math.floor((subtotal * offer.discountPercentage) / 100);
}
