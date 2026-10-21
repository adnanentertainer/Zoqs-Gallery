import { getSiteSetting } from "@/lib/services/settingsService";
import {
  DEFAULT_WEDDING_PROMOTION_SETTINGS,
  type WeddingPromotionSettings,
} from "@/types/weddingPromotion";

/**
 * Always returns a filled settings object (never null) — same convention as
 * getBlessedFridayOffer(). Callers branch on `.enabled` to decide whether to
 * render the homepage banner/favourites section.
 */
export async function getWeddingPromotionSettings(): Promise<WeddingPromotionSettings> {
  const stored =
    await getSiteSetting<WeddingPromotionSettings>("wedding_promotion");
  return stored ?? DEFAULT_WEDDING_PROMOTION_SETTINGS;
}
