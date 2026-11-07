export interface SaleOffer {
  enabled: boolean;
  /** Shown in customer-facing messaging instead of a generic "Sale" label —
   * e.g. "11.11 Mega Sale". Empty string falls back to "Sale". */
  name: string;
  discountPercentage: number;
  minSpend: number;
  /** ISO date ("YYYY-MM-DD"), or null for no start bound. When set
   * alongside endDate, the sale is only actually live within
   * [startDate, endDate] (inclusive, Asia/Karachi calendar day) even while
   * `enabled` stays on — lets an admin schedule a date range (e.g. 11/11)
   * in advance and flip `enabled` on whenever, without it leaking past its
   * window. See lib/checkout/sale.ts isSaleActive(). */
  startDate: string | null;
  /** ISO date ("YYYY-MM-DD"), or null for no end bound. */
  endDate: string | null;
}

export const DEFAULT_SALE_OFFER: SaleOffer = {
  enabled: false,
  name: "",
  discountPercentage: 10,
  minSpend: 0,
  startDate: null,
  endDate: null,
};
