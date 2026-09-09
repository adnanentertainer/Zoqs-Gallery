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
  clearFiltersHref?: string;
}

export function ProductResults({
  products,
  pageSize = PRODUCTS_PER_PAGE,
  emptyTitle = "No jewellery found",
  emptyDescription = "Try adjusting your filters or search for something else.",
  clearFiltersHref,
}: ProductResultsProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={clearFiltersHref ? "Clear Filters" : undefined}
        actionHref={clearFiltersHref}
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
