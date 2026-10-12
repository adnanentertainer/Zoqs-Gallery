import type { ShippingSettings } from "@/lib/checkout/shipping";
import type { Product } from "@/types";

export function getDefaultVariantSelections(
  product: Product,
): Record<string, string> {
  const selections: Record<string, string> = {};
  for (const group of product.variants ?? []) {
    const defaultOption =
      group.options.find((option) => option.inStock !== false) ??
      group.options[0];
    selections[group.type] = defaultOption.value;
  }
  return selections;
}

export function makeCartItemKey(
  productSlug: string,
  selectedVariants?: Record<string, string>,
): string {
  const entries = Object.entries(selectedVariants ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (entries.length === 0) return productSlug;
  return `${productSlug}::${entries.map(([type, value]) => `${type}=${value}`).join(",")}`;
}

function getSelectedVariantOptions(
  product: Product,
  selectedVariants?: Record<string, string>,
) {
  if (!selectedVariants) return [];
  return (product.variants ?? []).flatMap((group) => {
    const value = selectedVariants[group.type];
    const option = group.options.find((candidate) => candidate.value === value);
    return option ? [{ group, option }] : [];
  });
}

export function getVariantUnitPrice(
  product: Product,
  selectedVariants?: Record<string, string>,
): number {
  const override = getSelectedVariantOptions(product, selectedVariants).find(
    ({ option }) => option.priceOverride !== undefined,
  )?.option.priceOverride;
  return override ?? product.price;
}

export function getVariantSummaryLabel(
  product: Product,
  selectedVariants?: Record<string, string>,
): string | undefined {
  const labels = getSelectedVariantOptions(product, selectedVariants).map(
    ({ option }) => option.label,
  );
  return labels.length > 0 ? labels.join(" / ") : undefined;
}

export interface FreeShippingProgress {
  threshold: number;
  remaining: number;
  percentage: number;
  qualifies: boolean;
  /** Rs. 0 once qualifies is true, otherwise settings.flatShippingCost —
   * shown in the cart (not just at checkout) so the flat fee is never a
   * surprise sprung on the customer after they've filled in their address. */
  shippingCost: number;
}

export function getFreeShippingProgress(
  subtotal: number,
  settings: ShippingSettings,
): FreeShippingProgress {
  const threshold = settings.freeShippingThreshold;
  const qualifies = subtotal >= threshold;
  const remaining = qualifies ? 0 : threshold - subtotal;
  const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));
  const shippingCost = qualifies ? 0 : settings.flatShippingCost;
  return { threshold, remaining, percentage, qualifies, shippingCost };
}
