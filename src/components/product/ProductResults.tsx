"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/product/EmptyState";
import { Button } from "@/components/ui/Button";
import { PRODUCTS_PER_PAGE } from "@/constants/filters";
import type { Product } from "@/types";

interface ProductResultsProps {
  products: Product[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Shown as a "Clear Filters" link on filterable pages (Shop, Category,
   * Search) — pass emptyActionLabel/emptyActionHref instead for a curated,
   * unfilterable page (New Arrivals, Best Sellers) where "clear filters"
   * wouldn't make sense. */
  clearFiltersHref?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

export function ProductResults({
  products,
  pageSize = PRODUCTS_PER_PAGE,
  emptyTitle = "No jewellery found",
  emptyDescription = "Try adjusting your filters or search for something else.",
  clearFiltersHref,
  emptyActionLabel,
  emptyActionHref,
}: ProductResultsProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={
          emptyActionLabel ?? (clearFiltersHref ? "Clear Filters" : undefined)
        }
        actionHref={emptyActionHref ?? clearFiltersHref}
      />
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="flex flex-col gap-8">
      <p className="font-body text-sm text-muted">
        Showing 1–{visibleProducts.length} of {products.length} products
      </p>
      <ProductGrid products={visibleProducts} />
      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((count) => count + pageSize)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
