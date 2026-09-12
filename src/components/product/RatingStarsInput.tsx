"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingStarsInput({ value, onChange }: RatingStarsInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const position = index + 1;
        const filled = position <= display;
        return (
          <button
            key={position}
            type="button"
            role="radio"
            aria-checked={value === position}
            aria-label={`${position} star${position === 1 ? "" : "s"}`}
            onMouseEnter={() => setHovered(position)}
            onClick={() => onChange(position)}
            className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                filled ? "fill-gold text-gold" : "fill-none text-beige",
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
