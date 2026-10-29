export interface ShippingSettings {
  freeShippingThreshold: number;
  flatShippingCost: number;
  /** Whether the free-shipping-above-threshold perk applies to an order with
   * no offer/promo code in play. Independently configurable from
   * freeShippingEnabledOffers (see admin Settings page). */
  freeShippingEnabledNormalOrders: boolean;
  /** Whether the free-shipping-above-threshold perk applies to an order that
   * has the Blessed Friday offer enabled store-wide or redeemed a promo
   * code. create_order() applies the same rule server-side — this is only
   * ever used for client-facing preview before submission. */
  freeShippingEnabledOffers: boolean;
}

// Takes the amount actually being charged for goods (subtotal minus any
// promo discount), not the pre-discount subtotal — the threshold is meant to
// reward orders that are really worth Rs. X to the store, not ones that only
// look that big before a coupon is applied.
export function calculateShippingCost(
  discountedSubtotal: number,
  settings: ShippingSettings,
  isOfferActive: boolean,
): number {
  const freeShippingEnabled = isOfferActive
    ? settings.freeShippingEnabledOffers
    : settings.freeShippingEnabledNormalOrders;
  return freeShippingEnabled && discountedSubtotal >= settings.freeShippingThreshold
    ? 0
    : settings.flatShippingCost;
}
