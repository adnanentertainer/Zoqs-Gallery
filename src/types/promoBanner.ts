export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  promoText: string;
  /** The linked promo code's own code, resolved via a join — never stored
   * as text on the banner row, so it can never drift from the real code. */
  promoCode: string | null;
  buttonText: string;
  buttonLink: string;
  bannerImageUrl: string;
  backgroundImageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  displayOrder: number;
  /** When true, `subtitle` above is already overridden with text computed
   * live from the Blessed Friday Offer's discount percentage and minimum
   * spend (see promoBannerService.ts) — the stored subtitle is ignored. */
  autoSyncBlessedFriday: boolean;
}

/** Shape submitted from the admin create/edit form. */
export interface AdminPromoBannerInput {
  title: string;
  subtitle: string;
  promoText: string;
  promoCodeId: string | null;
  buttonText: string;
  buttonLink: string;
  bannerImageUrl: string;
  backgroundImageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  displayOrder: number;
  /** When true, the public site ignores `subtitle` and computes it live from
   * the Blessed Friday Offer's discount percentage and minimum spend. */
  autoSyncBlessedFriday: boolean;
}

export interface AdminPromoBannerListItem {
  id: string;
  title: string;
  promoCode: string | null;
  bannerImageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  displayOrder: number;
}
