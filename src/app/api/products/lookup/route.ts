import { NextResponse, type NextRequest } from "next/server";
import { getProductsBySlugs } from "@/lib/services/productService";

const MAX_SLUGS = 50;

/**
 * Backs the client-side product cache (src/lib/productCache.ts) for
 * cart/wishlist items whose product wasn't already rendered (and cached)
 * this session — e.g. an item added in a previous visit. Returns the same
 * public product data any product page already exposes, just batched by slug.
 */
export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = [
    ...new Set(
      slugsParam
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_SLUGS);

  if (slugs.length === 0) {
    return NextResponse.json([]);
  }

  const products = await getProductsBySlugs(slugs);
  // getProductsBySlugs doesn't guarantee row order -- restore the order the
  // caller requested so clients can zip results back up with their slugs.
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const ordered = slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    );

  return NextResponse.json(ordered);
}
