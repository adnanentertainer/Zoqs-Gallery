export interface WeddingPromotionSettings {
  /** Toggles the homepage "The Wedding Edit" banner and "Wedding Season
   * Favourites" section only — the /wedding-collection page and the
   * "Wedding Collection" nav link stay available either way, same as any
   * other catalogue page. */
  enabled: boolean;
  /** Empty string means "no override, keep the built-in default photo" —
   * same convention as default_hero_image, since site_settings.value is a
   * NOT NULL jsonb column. */
  imageUrl: string;
}

export const DEFAULT_WEDDING_PROMOTION_SETTINGS: WeddingPromotionSettings = {
  enabled: true,
  imageUrl: "",
};
