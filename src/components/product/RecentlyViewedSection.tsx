"use client";

import { useEffect, useReducer, useSyncExternalStore } from "react";
import { ProductSection } from "@/components/home/ProductSection";
import { recentlyViewedStore } from "@/lib/recentlyViewedStore";
import {
  ensureProductsCached,
  getCachedProduct,
  subscribeToProductCache,
} from "@/lib/productCache";
import type { Product } from "@/types";

/**
 * Shows the shopper's own recently-viewed products, read from
 * lib/recentlyViewedStore.ts and resolved to live product data via the
 * shared cache — never from the stale mock catalog. A product deleted from
 * the admin portal just won't resolve here, so it disappears on its own
 * without any extra cleanup step.
 */
export function RecentlyViewedSection({
  excludeSlug,
}: {
  excludeSlug: string;
}) {
  const items = useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    recentlyViewedStore.getServerSnapshot,
  );
  const [, bumpProductCacheVersion] = useReducer(
    (count: number) => count + 1,
    0,
  );
  useEffect(() => subscribeToProductCache(bumpProductCacheVersion), []);

  const slugs = items.filter((slug) => slug !== excludeSlug);

  useEffect(() => {
    ensureProductsCached(slugs);
    // slugs is derived fresh each render from `items` + `excludeSlug`; only
    // re-run the fetch when the actual slug list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  const products = slugs
    .map((slug) => getCachedProduct(slug))
    .filter((product): product is Product => Boolean(product));

  if (products.length === 0) return null;

  return (
    <ProductSection
      title="Recently Viewed"
      products={products}
      viewAllLabel="Continue Shopping"
      viewAllHref="/shop"
    />
  );
}
