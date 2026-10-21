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
}

export const DEFAULT_WEDDING_PROMOTION_SETTINGS: WeddingPromotionSettings = {
  enabled: true,
  showInNav: true,
  imageUrl: "",
};
