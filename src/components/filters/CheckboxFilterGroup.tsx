"use client";

import { ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface CheckboxFilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  idPrefix?: string;
}

export function CheckboxFilterGroup({
  title,
  options,
  selected,
  onChange,
  idPrefix = "filter",
}: CheckboxFilterGroupProps) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <details className="group border-b border-beige py-4 first:pt-0" open>
      <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-semibold text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        {title}
        <ChevronDown
          className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <fieldset className="mt-3 flex flex-col gap-2.5">
        <legend className="sr-only">{title}</legend>
        {options.map((option) => {
          const inputId = `${idPrefix}-${title}-${option.value}`
            .replace(/\s+/g, "-")
            .toLowerCase();
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-primary"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 shrink-0 rounded-sm border-beige accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>
    </details>
  );
}
