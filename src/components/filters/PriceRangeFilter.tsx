"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICE_RANGE_OPTIONS } from "@/constants/filters";

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (next: { minPrice?: number; maxPrice?: number }) => void;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <details className="group border-b border-beige py-4 first:pt-0" open>
      <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-semibold text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        Price
        <ChevronDown
          className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div
        role="radiogroup"
        aria-label="Price range"
        className="mt-3 flex flex-col gap-2"
      >
        {PRICE_RANGE_OPTIONS.map((range) => {
          const isSelected = range.min === minPrice && range.max === maxPrice;
          return (
            <button
              key={range.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() =>
                onChange(
                  isSelected
                    ? { minPrice: undefined, maxPrice: undefined }
                    : { minPrice: range.min, maxPrice: range.max },
                )
              }
              className={cn(
                "rounded-sm border px-3 py-2 text-left font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                isSelected
                  ? "border-gold bg-gold/10 font-medium text-primary"
                  : "border-beige text-primary hover:border-gold",
              )}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
