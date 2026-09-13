"use client";

import { useEffect, useReducer } from "react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { EmptyState, ProductGrid } from "@/components/product";
import { useWishlist } from "@/context/WishlistContext";
import {
  ensureProductsCached,
  getCachedProduct,
  subscribeToProductCache,
} from "@/lib/productCache";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items } = useWishlist();
  const [, bumpProductCacheVersion] = useReducer((count: number) => count + 1, 0);

  useEffect(() => subscribeToProductCache(bumpProductCacheVersion), []);
  useEffect(() => {
    ensureProductsCached(items);
  }, [items]);

  const products = items
    .map((slug) => getCachedProduct(slug))
    .filter((product): product is Product => Boolean(product));

  useEffect(() => {
    document.title = "Wishlist | ZOQ's Gallery";
  }, []);

  return (
    <Container className="flex flex-col gap-6 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <div className="flex flex-col gap-2">
        <Heading variant="h1" as="h1">
          Wishlist
        </Heading>
        <Text variant="body" className="text-muted">
          {products.length} {products.length === 1 ? "item" : "items"} saved
        </Text>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save the pieces you love and find them here anytime."
          actionLabel="Continue Shopping"
          actionHref="/shop"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
