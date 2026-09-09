"use client";

import { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (next: number) => void;
  label?: string;
  compact?: boolean;
}

export function QuantitySelector({
  value,
  max,
  onChange,
  label = "Quantity",
  compact = false,
}: QuantitySelectorProps) {
  const labelId = useId();

  function decrement() {
    onChange(Math.max(1, value - 1));
  }

  function increment() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div className="flex flex-col gap-2">
      {!compact && (
        <span
          id={labelId}
          className="font-body text-sm font-medium text-primary"
        >
          {label}
        </span>
      )}
      <div
        className={cn(
          "inline-flex w-fit items-center rounded-sm border border-beige",
          compact ? "h-9" : "h-11",
        )}
        role="group"
        aria-label={compact ? label : undefined}
        aria-labelledby={compact ? undefined : labelId}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 1}
          aria-label="Decrease quantity"
          className={cn(
            "flex h-full items-center justify-center text-primary transition-colors hover:bg-beige disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            compact ? "w-9" : "w-11",
          )}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          aria-live="polite"
          className={cn(
            "text-center font-body font-medium text-primary",
            compact ? "w-8 text-sm" : "w-10 text-sm",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase quantity"
          className={cn(
            "flex h-full items-center justify-center text-primary transition-colors hover:bg-beige disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            compact ? "w-9" : "w-11",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
