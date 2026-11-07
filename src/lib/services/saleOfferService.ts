import { getSiteSetting } from "@/lib/services/settingsService";
import { DEFAULT_SALE_OFFER, type SaleOffer } from "@/types/saleOffer";

/**
 * Always returns a filled settings object (never null) — callers branch on
 * `.enabled`/isSaleActive() themselves, the same way
 * getBlessedFridayOffer() is unconditional and checkout/cart derive their
 * own display logic from it.
 */
export async function getSaleOffer(): Promise<SaleOffer> {
  const stored = await getSiteSetting<SaleOffer>("sale_offer");
  return stored ?? DEFAULT_SALE_OFFER;
}
