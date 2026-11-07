import type { SaleOffer } from "@/types/saleOffer";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";

// Pakistan Standard Time -- same locale basis as colorTheme's day-of-week
// scheduling (src/types/colorTheme.ts), so "today" for the sale's start/end
// dates matches the storefront's own timezone instead of the server's.
const SITE_TIME_ZONE = "Asia/Karachi";

function todayDateString(now: Date): string {
  // en-CA formats as YYYY-MM-DD, which sorts/compares the same way as the
  // admin-entered startDate/endDate strings.
  return new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIME_ZONE }).format(
    now,
  );
}

/**
 * Whether the Sale is currently live: `enabled` must be on AND today must
 * fall inside [startDate, endDate] when either bound is set. This is what
 * lets an admin pre-schedule a date range (11/11, say) once and then flip
 * `enabled` on/off anytime without it ever running outside that window.
 */
export function isSaleActive(offer: SaleOffer, now: Date = new Date()): boolean {
  if (!offer.enabled) return false;
  const today = todayDateString(now);
  if (offer.startDate && today < offer.startDate) return false;
  if (offer.endDate && today > offer.endDate) return false;
  return true;
}

/**
 * Client-facing preview only — create_order() independently recomputes
 * this from site_settings at order time and is the sole authority over
 * what's actually charged (same trust boundary as
 * calculateBlessedFridayDiscount/promo codes). Mirrors create_order()'s own
 * rounding (floor) exactly so the checkout preview never shows a different
 * amount than what gets charged.
 */
export function calculateSaleDiscount(
  subtotal: number,
  offer: SaleOffer,
  now: Date = new Date(),
): number {
  if (!isSaleActive(offer, now) || subtotal < offer.minSpend) return 0;
  return Math.floor((subtotal * offer.discountPercentage) / 100);
}

/** Generic shape used only for non-monetary, informational display (the
 * delivery-info badge, product tabs, announcement bar) — never for
 * computing an actual discount amount. */
export interface DisplayOffer {
  enabled: boolean;
  discountPercentage: number;
  minSpend: number;
  label: string;
}

/**
 * Resolves which storewide automatic offer should currently be shown in
 * purely informational copy (not checkout totals): the Sale whenever it's
 * active, falling back to Blessed Friday otherwise. The Sale overriding
 * Blessed Friday here mirrors the same override used for the actual
 * discount amount (see CartContext/CheckoutForm) — only one of the two is
 * ever "the" active automatic offer at a time.
 */
export function resolveDisplayOffer(
  sale: SaleOffer,
  blessedFriday: BlessedFridayOffer,
  now: Date = new Date(),
): DisplayOffer {
  if (isSaleActive(sale, now)) {
    return {
      enabled: true,
      discountPercentage: sale.discountPercentage,
      minSpend: sale.minSpend,
      label: sale.name.trim() || "Sale",
    };
  }
  return {
    enabled: blessedFriday.enabled,
    discountPercentage: blessedFriday.discountPercentage,
    minSpend: blessedFriday.minSpend,
    label: "Blessed Friday Offer",
  };
}
