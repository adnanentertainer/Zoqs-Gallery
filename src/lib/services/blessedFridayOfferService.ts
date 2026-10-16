import { getSiteSetting } from "@/lib/services/settingsService";
import {
  DEFAULT_BLESSED_FRIDAY_OFFER,
  type BlessedFridayOffer,
} from "@/types/blessedFridayOffer";

/**
 * Always returns a filled settings object (never null) — callers branch on
 * `.enabled` themselves, the same way getShippingSettings() is unconditional
 * and checkout/cart derive their own display logic from it.
 */
export async function getBlessedFridayOffer(): Promise<BlessedFridayOffer> {
  const stored = await getSiteSetting<BlessedFridayOffer>(
    "blessed_friday_offer",
  );
  return stored ?? DEFAULT_BLESSED_FRIDAY_OFFER;
}
