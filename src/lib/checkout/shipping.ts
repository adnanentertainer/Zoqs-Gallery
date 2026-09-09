export interface ShippingSettings {
  freeShippingThreshold: number;
  flatShippingCost: number;
}

export function calculateShippingCost(
  subtotal: number,
  settings: ShippingSettings,
): number {
  return subtotal >= settings.freeShippingThreshold
    ? 0
    : settings.flatShippingCost;
}
