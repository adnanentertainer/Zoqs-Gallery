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
