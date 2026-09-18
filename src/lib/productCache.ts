"use client";

import type { Product } from "@/types";

// Cart and wishlist persist only product SLUGS to localStorage, but need
// full Product data (name, price, image, stock) to render and to validate
// quantities. This in-memory cache is the single source of truth they read
// from — populated two ways: (1) synchronously, by product-rendering
// components (ProductCard, ProductActions) registering the real Product
// they already fetched from Supabase as soon as it renders, and (2) as a
// fallback, by fetching /api/products/lookup for any slug a cart/wishlist
// item references that hasn't been registered yet (e.g. an item added in a
// previous session, before this page load rendered that product anywhere).
type Listener = () => void;

const cache = new Map<string, Product>();
const listeners = new Set<Listener>();
const pendingFetches = new Set<string>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function registerProduct(product: Product): void {
  cache.set(product.slug, product);
  notify();
}

export function registerProducts(products: Product[]): void {
  if (products.length === 0) return;
  for (const product of products) cache.set(product.slug, product);
  notify();
}

export function getCachedProduct(slug: string): Product | undefined {
  return cache.get(slug);
}

export function subscribeToProductCache(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Returns the subset of `slugs` that are confirmed gone (the lookup ran and
// found no matching active product) — as opposed to merely not-yet-fetched.
// Callers (e.g. WishlistContext) use this to prune dead references instead
// of leaving them stuck in storage forever.
export async function ensureProductsCached(slugs: string[]): Promise<string[]> {
  const missing = [...new Set(slugs)].filter(
    (slug) => !cache.has(slug) && !pendingFetches.has(slug),
  );
  if (missing.length === 0) return [];

  missing.forEach((slug) => pendingFetches.add(slug));
  try {
    const params = new URLSearchParams({ slugs: missing.join(",") });
    const response = await fetch(`/api/products/lookup?${params.toString()}`);
    if (!response.ok) return [];
    const products = (await response.json()) as Product[];
    registerProducts(products);
    const foundSlugs = new Set(products.map((product) => product.slug));
    return missing.filter((slug) => !foundSlugs.has(slug));
  } catch {
    // Network error — treat as unresolved rather than confirmed-missing, so
    // a dropped connection doesn't get an item wrongly pruned.
    return [];
  } finally {
    missing.forEach((slug) => pendingFetches.delete(slug));
  }
}
