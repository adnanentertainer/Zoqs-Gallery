"use client";

import { useEffect } from "react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { EmptyState, ProductGrid } from "@/components/product";
import { useWishlist } from "@/context/WishlistContext";
import { getProductBySlug } from "@/lib/products";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items } = useWishlist();
  const products = items
    .map((slug) => getProductBySlug(slug))
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
