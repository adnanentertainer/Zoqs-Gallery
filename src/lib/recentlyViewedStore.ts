"use client";

import { createLocalStorageStore } from "@/lib/localStorageStore";

const STORAGE_KEY = "zoqs-gallery-recently-viewed";
const MAX_ITEMS = 8;

function isValidRecentlyViewed(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((slug) => typeof slug === "string")
  );
}

// Stores product SLUGS, not ids — same reasoning as cart/wishlist (see the
// comment in CartContext.tsx): full product data comes from the shared
// client-side cache in lib/productCache.ts, which is keyed by slug.
export const recentlyViewedStore = createLocalStorageStore<string[]>(
  STORAGE_KEY,
  [],
  isValidRecentlyViewed,
);

/**
 * Records a product visit, moving it to the front of the list and capping
 * the list at MAX_ITEMS. A product that's since been removed from the
 * catalog is never re-added here, and any stale slug already in the list
 * simply won't resolve to a product when looked up (see
 * lib/productCache.ts / /api/products/lookup), so it quietly disappears
 * from the "Recently Viewed" section on its own.
 */
export function recordProductView(slug: string): void {
  const current = recentlyViewedStore.getSnapshot();
  const next = [slug, ...current.filter((item) => item !== slug)].slice(
    0,
    MAX_ITEMS,
  );
  recentlyViewedStore.set(next);
}
