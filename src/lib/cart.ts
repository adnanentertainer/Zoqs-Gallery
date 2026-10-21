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

/** This selection's own tracked stock (product_variants.stock), or
 * undefined when no selected option carries one — meaning it draws from
 * the base product's shared `stock` instead. */
export function getDedicatedVariantStock(
  product: Product,
  selectedVariants?: Record<string, string>,
): number | undefined {
  for (const group of product.variants ?? []) {
    const value = selectedVariants?.[group.type];
    const option = group.options.find((candidate) => candidate.value === value);
    if (option && typeof option.stock === "number") return option.stock;
  }
  return undefined;
}

interface CartQuantityLine {
  productSlug: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

/**
 * How many more units of this exact product+variant selection the cart can
 * hold right now. A variant with its own tracked stock is capped
 * independently; a variant with no stock of its own (the common case for
 * e.g. a plain "Color" swatch with no per-color stock entered) shares the
 * base product's `stock` with every other cart line of the same product
 * that *also* has no dedicated stock — two colors both drawing from one
 * shared unit count as one pool between them, matching exactly what
 * create_order() enforces at checkout (see the "Insufficient stock"
 * check there). Without this, two different variants of the same
 * low-stock product could each look addable on their own, only for
 * checkout to reject the combined order outright.
 *
 * `excludeKey` is the cart key of the line being updated (e.g. the one an
 * increment/quantity-change applies to), so it isn't double-counted
 * against its own reservation.
 */
export function getMaxAddableQuantity(
  existingLines: CartQuantityLine[],
  product: Product,
  selectedVariants: Record<string, string> | undefined,
  excludeKey?: string,
): number {
  const dedicatedStock = getDedicatedVariantStock(product, selectedVariants);
  if (dedicatedStock !== undefined) {
    return Math.max(dedicatedStock, 0);
  }

  const reservedByOtherLines = existingLines
    .filter((line) => line.productSlug === product.slug)
    .filter(
      (line) =>
        makeCartItemKey(product.slug, line.selectedVariants) !== excludeKey,
    )
    .filter(
      (line) =>
        getDedicatedVariantStock(product, line.selectedVariants) === undefined,
    )
    .reduce((sum, line) => sum + line.quantity, 0);

  return Math.max(product.stock - reservedByOtherLines, 0);
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

/** The selected variant's own photo (e.g. a color swatch with its own
 * image), falling back to the product's primary image when that variant
 * has none set. Used wherever a cart/order line shows a thumbnail, so a
 * Purple line doesn't display the Green photo just because it's first in
 * the product's gallery. */
export function getVariantImage(
  product: Product,
  selectedVariants?: Record<string, string>,
): string {
  const match = getSelectedVariantOptions(product, selectedVariants).find(
    ({ option }) => option.image,
  )?.option.image;
  return match ?? product.images[0];
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
