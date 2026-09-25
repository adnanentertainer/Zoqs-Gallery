export interface ShippingSettings {
  freeShippingThreshold: number;
  flatShippingCost: number;
}

// Takes the amount actually being charged for goods (subtotal minus any
// promo discount), not the pre-discount subtotal — the threshold is meant to
// reward orders that are really worth Rs. X to the store, not ones that only
// look that big before a coupon is applied.
export function calculateShippingCost(
  discountedSubtotal: number,
  settings: ShippingSettings,
): number {
  return discountedSubtotal >= settings.freeShippingThreshold
    ? 0
    : settings.flatShippingCost;
}
