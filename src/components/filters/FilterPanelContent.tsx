"use client";

import { CheckboxFilterGroup } from "@/components/filters/CheckboxFilterGroup";
import { SingleSelectFilterGroup } from "@/components/filters/SingleSelectFilterGroup";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import { Button } from "@/components/ui/Button";
import { categories } from "@/data/categories";
import {
  AVAILABILITY_OPTIONS,
  COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  OCCASION_OPTIONS,
  RATING_OPTIONS,
  SPECIAL_FILTER_OPTIONS,
} from "@/constants/filters";
import { createEmptyFilterValues, hasActiveFilters } from "@/lib/products";
import type { FilterValues } from "@/types";

const colorOptions = COLOR_OPTIONS.map((value) => ({ value, label: value }));
const materialOptions = MATERIAL_OPTIONS.map((value) => ({
  value,
  label: value,
}));
const occasionOptions = OCCASION_OPTIONS.map((value) => ({
  value,
  label: value,
}));
const categoryOptions = categories.map((category) => ({
  value: category.slug,
  label: category.name,
}));
const ratingOptions = RATING_OPTIONS.map((value) => ({
  value: String(value),
  label: `${value} stars & above`,
}));

interface FilterPanelContentProps {
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  showCategoryFilter?: boolean;
  showHeader?: boolean;
  idPrefix: string;
}

export function FilterPanelContent({
  values,
  onChange,
  showCategoryFilter = true,
  showHeader = true,
  idPrefix,
}: FilterPanelContentProps) {
  const showClearAll = hasActiveFilters(values);

  return (
    <div className="flex flex-col">
      {showHeader && (
        <div className="mb-2 flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-primary">
            Filters
          </span>
          {showClearAll && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(createEmptyFilterValues())}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {showCategoryFilter && (
        <CheckboxFilterGroup
          title="Category"
          options={categoryOptions}
          selected={values.category}
          onChange={(category) => onChange({ ...values, category })}
          idPrefix={idPrefix}
        />
      )}

      <PriceRangeFilter
        minPrice={values.minPrice}
        maxPrice={values.maxPrice}
        onChange={({ minPrice, maxPrice }) =>
          onChange({ ...values, minPrice, maxPrice })
        }
      />

      <CheckboxFilterGroup
        title="Color"
        options={colorOptions}
        selected={values.color}
        onChange={(color) => onChange({ ...values, color })}
        idPrefix={idPrefix}
      />

      <CheckboxFilterGroup
        title="Material"
        options={materialOptions}
        selected={values.material}
        onChange={(material) => onChange({ ...values, material })}
        idPrefix={idPrefix}
      />

      <CheckboxFilterGroup
        title="Occasion"
        options={occasionOptions}
        selected={values.occasion}
        onChange={(occasion) => onChange({ ...values, occasion })}
        idPrefix={idPrefix}
      />

      <SingleSelectFilterGroup
        title="Rating"
        options={ratingOptions}
        selected={
          values.rating !== undefined ? String(values.rating) : undefined
        }
        onChange={(rating) =>
          onChange({ ...values, rating: rating ? Number(rating) : undefined })
        }
      />

      <SingleSelectFilterGroup
        title="Availability"
        options={AVAILABILITY_OPTIONS}
        selected={values.availability}
        onChange={(availability) =>
          onChange({
            ...values,
            availability: availability as FilterValues["availability"],
          })
        }
      />

      <CheckboxFilterGroup
        title="Highlights"
        options={SPECIAL_FILTER_OPTIONS}
        selected={values.special}
        onChange={(special) =>
          onChange({ ...values, special: special as FilterValues["special"] })
        }
        idPrefix={idPrefix}
      />
    </div>
  );
}
