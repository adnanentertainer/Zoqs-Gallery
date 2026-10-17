"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";
import {
  AVAILABILITY_OPTIONS,
  PRICE_RANGE_OPTIONS,
  SPECIAL_FILTER_OPTIONS,
} from "@/constants/filters";
import {
  buildFilterSearchParams,
  createEmptyFilterValues,
  hasActiveFilters,
  parseFilterValues,
} from "@/lib/products";
import { buildUrl, formatPrice } from "@/lib/utils";
import type { FilterValues } from "@/types";

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

function priceChipLabel(minPrice?: number, maxPrice?: number): string {
  const preset = PRICE_RANGE_OPTIONS.find(
    (range) => range.min === minPrice && range.max === maxPrice,
  );
  if (preset) return preset.label;
  if (minPrice !== undefined && maxPrice !== undefined)
    return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
  if (minPrice !== undefined) return `Above ${formatPrice(minPrice)}`;
  return `Under ${formatPrice(maxPrice ?? 0)}`;
}

/**
 * Active filter "pills" shown above the product grid on filterable listing
 * pages — lets shoppers see and remove one filter at a time without opening
 * the full filter panel.
 */
export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const values = parseFilterValues(searchParams);

  if (!hasActiveFilters(values)) return null;

  function apply(next: FilterValues) {
    const params = buildFilterSearchParams(next, {
      sort: searchParams.get("sort") ?? undefined,
    });
    router.push(buildUrl(pathname, params), { scroll: false });
  }

  const chips: Chip[] = [];

  for (const slug of values.category) {
    const name = categories.find((category) => category.slug === slug)?.name ?? slug;
    chips.push({
      key: `category-${slug}`,
      label: name,
      onRemove: () =>
        apply({ ...values, category: values.category.filter((c) => c !== slug) }),
    });
  }

  for (const color of values.color) {
    chips.push({
      key: `color-${color}`,
      label: color,
      onRemove: () =>
        apply({ ...values, color: values.color.filter((c) => c !== color) }),
    });
  }

  for (const material of values.material) {
    chips.push({
      key: `material-${material}`,
      label: material,
      onRemove: () =>
        apply({ ...values, material: values.material.filter((m) => m !== material) }),
    });
  }

  for (const occasion of values.occasion) {
    chips.push({
      key: `occasion-${occasion}`,
      label: occasion,
      onRemove: () =>
        apply({ ...values, occasion: values.occasion.filter((o) => o !== occasion) }),
    });
  }

  for (const special of values.special) {
    const label =
      SPECIAL_FILTER_OPTIONS.find((option) => option.value === special)?.label ??
      special;
    chips.push({
      key: `special-${special}`,
      label,
      onRemove: () =>
        apply({ ...values, special: values.special.filter((s) => s !== special) }),
    });
  }

  if (values.minPrice !== undefined || values.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: priceChipLabel(values.minPrice, values.maxPrice),
      onRemove: () => apply({ ...values, minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (values.rating !== undefined) {
    chips.push({
      key: "rating",
      label: `${values.rating} stars & above`,
      onRemove: () => apply({ ...values, rating: undefined }),
    });
  }

  if (values.availability) {
    const label =
      AVAILABILITY_OPTIONS.find((option) => option.value === values.availability)
        ?.label ?? values.availability;
    chips.push({
      key: "availability",
      label,
      onRemove: () => apply({ ...values, availability: undefined }),
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-beige bg-beige/40 px-3 py-1.5 font-body text-sm text-primary transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => apply(createEmptyFilterValues())}
        className="rounded-sm font-body text-sm font-medium text-gold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        Clear All
      </button>
    </div>
  );
}
