"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/components/filters/CheckboxFilterGroup";

interface SingleSelectFilterGroupProps {
  title: string;
  options: FilterOption[];
  selected?: string;
  onChange: (next: string | undefined) => void;
}

export function SingleSelectFilterGroup({
  title,
  options,
  selected,
  onChange,
}: SingleSelectFilterGroupProps) {
  return (
    <details className="group border-b border-beige py-4 first:pt-0" open>
      <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-semibold text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        {title}
        <ChevronDown
          className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div
        role="radiogroup"
        aria-label={title}
        className="mt-3 flex flex-col gap-2"
      >
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(isSelected ? undefined : option.value)}
              className={cn(
                "rounded-sm border px-3 py-2 text-left font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                isSelected
                  ? "border-gold bg-gold/10 font-medium text-primary"
                  : "border-beige text-primary hover:border-gold",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
