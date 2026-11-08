import { NextResponse } from "next/server";
import { getProducts } from "@/lib/services/productService";
import type { ProductSearchSummary } from "@/types";

// Backs the client-side quick-search overlay (SearchTrigger), which can't
// call getProducts() directly since it's a "use client" component. Returns
// the same live, active-only catalog every listing page already shows —
// never the static mock fixture in src/data/products.ts -- but trimmed to
// just the fields the overlay's fuzzy match and suggestion row need, not
// the full hydrated Product (images/variants/description included) that
// /search's real results page needs.
export async function GET() {
  const products = await getProducts();
  const summaries: ProductSearchSummary[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    price: product.price,
    material: product.material,
    color: product.color,
    occasion: product.occasion,
    tags: product.tags,
  }));
  return NextResponse.json(summaries);
}
