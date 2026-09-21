import { unstable_cache } from "next/cache";
import { allProducts as mockAllProducts } from "@/data/products";
import {
  getProductBySlug as getMockProductBySlug,
  getRelatedProducts as getRelatedProductsFromPool,
} from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { computeRatingAggregate, mapProductRow } from "@/lib/supabase/mappers";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/types/supabase";
import type { Product } from "@/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariantRow =
  Database["public"]["Tables"]["product_variants"]["Row"];

// supabase-js can't statically type embedded relation selects (e.g.
// "*, categories(slug)") without full CLI-generated Relationships metadata,
// which we don't have without a real linked project — see src/types/supabase.ts.
// This shape is what PostgREST actually returns for that select at runtime.
interface ProductRowWithCategory extends ProductRow {
  categories: { slug: string } | null;
}

interface ProductQueryFilters {
  categorySlug?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

// Public catalog reads never depend on who's signed in (RLS allows public
// reads), so these use the cookie-less client and are wrapped in
// unstable_cache: the same expensive query is then reused across every
// visitor instead of re-running per request. `revalidate: 120` is a safety
// net; the actual freshness guarantee comes from revalidateTag(CACHE_TAGS.products)
// called by every admin/inventory/order path that changes product data (see
// adminProductService, inventoryService, purchaseService, orderService).
async function fetchActiveProductRowsUncached(
  filters: ProductQueryFilters = {},
): Promise<ProductRowWithCategory[]> {
  const supabase = getSupabasePublicClient();
  const embed = filters.categorySlug
    ? "categories!inner(slug)"
    : "categories(slug)";

  let query = supabase
    .from("products")
    .select(`*, ${embed}`)
    .eq("is_active", true);

  if (filters.categorySlug) {
    query = query.eq("categories.slug", filters.categorySlug);
  }
  if (filters.isFeatured) query = query.eq("is_featured", true);
  if (filters.isNew) query = query.eq("is_new", true);
  if (filters.isBestSeller) query = query.eq("is_best_seller", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductRowWithCategory[];
}

const fetchActiveProductRows = unstable_cache(
  fetchActiveProductRowsUncached,
  ["products:active-rows"],
  { tags: [CACHE_TAGS.products], revalidate: 120 },
);

async function fetchActiveProductRowBySlugUncached(
  slug: string,
): Promise<ProductRowWithCategory | null> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProductRowWithCategory | null;
}

const fetchActiveProductRowBySlug = unstable_cache(
  fetchActiveProductRowBySlugUncached,
  ["products:row-by-slug"],
  { tags: [CACHE_TAGS.products], revalidate: 120 },
);

function groupByProductId<T extends { product_id: string }>(
  rows: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.product_id) ?? [];
    list.push(row);
    map.set(row.product_id, list);
  }
  return map;
}

interface ProductRelations {
  images: ProductImageRow[];
  variants: ProductVariantRow[];
  reviews: { product_id: string; rating: number }[];
}

// Cache key is the sorted product id list (not the full rows), so this stays
// compact and shares an entry across callers that ask for the same set of
// products (e.g. a product page's related-products lookup landing on the
// same ids as a listing page already rendered).
async function fetchProductRelationsUncached(
  ids: string[],
): Promise<ProductRelations> {
  const supabase = getSupabasePublicClient();

  const [imagesResult, variantsResult, reviewsResult] = await Promise.all([
    supabase.from("product_images").select("*").in("product_id", ids),
    supabase.from("product_variants").select("*").in("product_id", ids),
    supabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", ids)
      .eq("is_approved", true),
  ]);

  if (imagesResult.error) throw imagesResult.error;
  if (variantsResult.error) throw variantsResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  return {
    images: (imagesResult.data ?? []) as ProductImageRow[],
    variants: (variantsResult.data ?? []) as ProductVariantRow[],
    reviews: (reviewsResult.data ?? []) as { product_id: string; rating: number }[],
  };
}

const fetchProductRelations = unstable_cache(
  fetchProductRelationsUncached,
  ["products:relations"],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.reviews], revalidate: 120 },
);

async function hydrateProducts(
  rows: ProductRowWithCategory[],
): Promise<Product[]> {
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((row) => row.id))].sort();
  const { images, variants, reviews } = await fetchProductRelations(ids);

  const imagesByProduct = groupByProductId(images);
  const variantsByProduct = groupByProductId(variants);

  const ratingsByProduct = new Map<string, number[]>();
  for (const row of reviews) {
    const list = ratingsByProduct.get(row.product_id) ?? [];
    list.push(row.rating);
    ratingsByProduct.set(row.product_id, list);
  }

  return rows.map((row) =>
    mapProductRow(
      row,
      row.categories?.slug ?? "",
      imagesByProduct.get(row.id) ?? [],
      variantsByProduct.get(row.id) ?? [],
      computeRatingAggregate(ratingsByProduct.get(row.id) ?? []),
    ),
  );
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockAllProducts;
  }

  try {
    const rows = await fetchActiveProductRows();
    return await hydrateProducts(rows);
  } catch (error) {
    console.error("[productService.getProducts] Supabase query failed:", error);
    throw new Error("Unable to load products right now.");
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return getMockProductBySlug(slug);
  }

  try {
    const row = await fetchActiveProductRowBySlug(slug);
    if (!row) return undefined;
    const [hydrated] = await hydrateProducts([row]);
    return hydrated;
  } catch (error) {
    console.error(
      "[productService.getProductBySlug] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load this product right now.");
  }
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockAllProducts.filter(
      (product) => product.categorySlug === categorySlug,
    );
  }

  try {
    const rows = await fetchActiveProductRows({ categorySlug });
    return await hydrateProducts(rows);
  } catch (error) {
    console.error(
      "[productService.getProductsByCategory] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load products for this category right now.");
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockAllProducts.filter((product) => product.isFeatured);
  }

  try {
    const rows = await fetchActiveProductRows({ isFeatured: true });
    return await hydrateProducts(rows);
  } catch (error) {
    console.error(
      "[productService.getFeaturedProducts] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load featured products right now.");
  }
}

export async function getNewArrivals(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockAllProducts.filter((product) => product.isNew);
  }

  try {
    const rows = await fetchActiveProductRows({ isNew: true });
    return await hydrateProducts(rows);
  } catch (error) {
    console.error(
      "[productService.getNewArrivals] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load new arrivals right now.");
  }
}

export async function getBestSellers(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockAllProducts.filter((product) => product.isBestSeller);
  }

  try {
    const rows = await fetchActiveProductRows({ isBestSeller: true });
    return await hydrateProducts(rows);
  } catch (error) {
    console.error(
      "[productService.getBestSellers] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load best sellers right now.");
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getRelatedProductsFromPool(mockAllProducts, product, limit);
  }

  try {
    const pool = await getProducts();
    return getRelatedProductsFromPool(pool, product, limit);
  } catch (error) {
    console.error(
      "[productService.getRelatedProducts] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load related products right now.");
  }
}
