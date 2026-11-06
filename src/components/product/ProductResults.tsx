"use client";

import { useEffect, useRef, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/product/EmptyState";
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < products.length;

  // Every caller that can actually change `products` at runtime (Shop,
  // Category, Wedding Collection, Search) already remounts this component
  // via a `key` tied to the filters/search params, which reinitializes
  // visibleCount fresh -- so no reset-on-prop-change effect is needed here.

  // Loads the next batch automatically once the sentinel below the grid
  // scrolls near the viewport -- replaces the old "Load More" button.
  // rootMargin starts the load a bit before the sentinel is actually
  // visible, so the next batch is ready by the time the user scrolls to it.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + pageSize);
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, pageSize]);

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

  return (
    <div className="flex flex-col gap-8">
      <p className="font-body text-sm text-muted" aria-live="polite">
        Showing 1–{visibleProducts.length} of {products.length} products
      </p>
      <ProductGrid products={visibleProducts} />
      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
      )}
    </div>
  );
}
