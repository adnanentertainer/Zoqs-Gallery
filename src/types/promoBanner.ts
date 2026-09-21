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
