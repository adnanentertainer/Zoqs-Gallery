"use client";

import { cn } from "@/lib/utils";
import type { ProductVariantGroup } from "@/types";

interface VariantSelectorProps {
  group: ProductVariantGroup;
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function VariantSelector({
  group,
  selectedValue,
  onSelect,
}: VariantSelectorProps) {
  const selectedOption = group.options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm font-medium text-primary">
        {group.label}
        {selectedOption && (
          <span className="font-normal text-muted">
            {" "}
            — {selectedOption.label}
          </span>
        )}
      </span>
      <div
        role="radiogroup"
        aria-label={group.label}
        className="flex flex-wrap gap-2"
      >
        {group.options.map((option) => {
          const isSelected = option.value === selectedValue;
          const isDisabled = option.inStock === false;
          const isSwatch = group.type === "color" && option.swatch;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={
                isDisabled ? `${option.label} (out of stock)` : option.label
              }
              disabled={isDisabled}
              onClick={() => onSelect(option.value)}
              title={option.label}
              className={cn(
                "flex items-center justify-center rounded-full border font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                isSwatch ? "h-9 w-9 p-0" : "h-10 min-w-11 px-4",
                isSelected
                  ? "border-gold ring-1 ring-gold"
                  : "border-beige hover:border-gold",
                isDisabled && "cursor-not-allowed opacity-40",
              )}
              style={isSwatch ? { background: option.swatch } : undefined}
            >
              {!isSwatch && option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
