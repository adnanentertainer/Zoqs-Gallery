export interface WeddingPromotionSettings {
  /** Toggles the homepage "The Wedding Edit" banner and "Wedding Season
   * Favourites" section only. The /wedding-collection page itself stays
   * directly reachable either way; see showInNav for the nav link, which is
   * controlled independently so either can be shown/hidden on its own. */
  enabled: boolean;
  /** Toggles the "Wedding Collection" nav link (desktop and mobile) —
   * independent of `enabled`, so the nav link and the homepage promotion
   * can each be switched on/off on their own. */
  showInNav: boolean;
  /** Empty string means "no override, keep the built-in default photo" —
   * same convention as default_hero_image, since site_settings.value is a
   * NOT NULL jsonb column. */
  imageUrl: string;
  /** Banner heading (e.g. "The Wedding Edit"). Empty string falls back to
   * the built-in default — same "empty means unset" convention as imageUrl. */
  bannerHeading: string;
  /** Banner supporting line under the heading. Empty falls back to default. */
  bannerSubtext: string;
  /** Banner primary button label. Empty falls back to default. */
  bannerButtonLabel: string;
}

export const DEFAULT_WEDDING_BANNER_HEADING = "The Wedding Edit";
export const DEFAULT_WEDDING_BANNER_SUBTEXT =
  "Beautiful jewellery for your most memorable celebrations.";
export const DEFAULT_WEDDING_BANNER_BUTTON_LABEL = "Shop Wedding Jewellery";

export const DEFAULT_WEDDING_PROMOTION_SETTINGS: WeddingPromotionSettings = {
  enabled: true,
  showInNav: true,
  imageUrl: "",
  bannerHeading: "",
  bannerSubtext: "",
  bannerButtonLabel: "",
};
