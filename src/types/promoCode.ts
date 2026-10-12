export type PromoDiscountType = "percentage" | "fixed";

export interface PromoCode {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  usageCount: number;
  isActive: boolean;
  description: string;
  createdAt: string;
  /** Homepage hero photo to show in place of the default model photo while
   * this code is live (within its starts_at/expires_at window). Uploaded via
   * the admin form to Supabase Storage (promo-hero-images bucket); null
   * means the hero keeps showing the default photo during this code's
   * window. */
  heroImageUrl: string | null;
}

/** Shape submitted from the admin create/edit form. */
export interface AdminPromoCodeInput {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  isActive: boolean;
  description: string;
  heroImageUrl: string | null;
}

export interface AdminPromoCodeListItem {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  usageCount: number;
  usageLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  /** Why this code exists/is scheduled, e.g. "Eid-ul-Fitr sale" — set from
   * the admin form (or seeded by a migration) so the reason behind a
   * scheduled campaign isn't just a bare code string. */
  description: string;
  heroImageUrl: string | null;
}

/** Result of validating a code at checkout — never trusted for the final
 * charge, only used to render the applied-discount preview. The real
 * enforcement happens again inside create_order() at order placement. */
export interface PromoValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  discountType?: PromoDiscountType;
  discountValue?: number;
  discountAmount?: number;
}
