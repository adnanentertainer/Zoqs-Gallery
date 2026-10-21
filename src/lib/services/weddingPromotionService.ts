import { getSiteSetting } from "@/lib/services/settingsService";
import {
  DEFAULT_WEDDING_PROMOTION_SETTINGS,
  type WeddingPromotionSettings,
} from "@/types/weddingPromotion";

/**
 * Always returns a filled settings object (never null) — same convention as
 * getBlessedFridayOffer(). Callers branch on `.enabled` to decide whether to
 * render the homepage banner/favourites section and the header's "Wedding
 * Collection" nav link (see RootLayout → Header/MobileNav).
 */
export async function getWeddingPromotionSettings(): Promise<WeddingPromotionSettings> {
  const stored =
    await getSiteSetting<Partial<WeddingPromotionSettings>>("wedding_promotion");
  // Spread over the defaults (not a bare `?? default`) so a row saved before
  // `imageUrl` existed still resolves to "" instead of undefined.
  return { ...DEFAULT_WEDDING_PROMOTION_SETTINGS, ...stored };
}
