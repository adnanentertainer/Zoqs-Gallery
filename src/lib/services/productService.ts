import { allProducts as mockAllProducts } from "@/data/products";
import {
  getProductBySlug as getMockProductBySlug,
  getRelatedProducts as getRelatedProductsFromPool,
} from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { computeRatingAggregate, mapProductRow } from "@/lib/supabase/mappers";
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

async function fetchActiveProductRows(
  filters: ProductQueryFilters = {},
): Promise<ProductRowWithCategory[]> {
  const supabase = await getSupabaseServerClient();
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

async function fetchActiveProductRowBySlug(
  slug: string,
): Promise<ProductRowWithCategory | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProductRowWithCategory | null;
}

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

async function hydrateProducts(
  rows: ProductRowWithCategory[],
): Promise<Product[]> {
  if (rows.length === 0) return [];

  const supabase = await getSupabaseServerClient();
  const ids = rows.map((row) => row.id);

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

  const imagesByProduct = groupByProductId(
    (imagesResult.data ?? []) as ProductImageRow[],
  );
  const variantsByProduct = groupByProductId(
    (variantsResult.data ?? []) as ProductVariantRow[],
  );

  const ratingsByProduct = new Map<string, number[]>();
  for (const row of (reviewsResult.data ?? []) as {
    product_id: string;
    rating: number;
  }[]) {
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
