import { allProducts } from "@/data/products";
import { categories } from "@/data/categories";
import type {
  Category,
  FilterValues,
  Product,
  ProductBadge,
  SortKey,
} from "@/types";

export function getDiscountPercentage(product: Product): number | undefined {
  if (!product.originalPrice || product.originalPrice <= product.price)
    return undefined;
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
}

export function isOnSale(product: Product): boolean {
  return getDiscountPercentage(product) !== undefined;
}

export function isInStock(product: Product): boolean {
  return product.stock > 0;
}

export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(product: Product): boolean {
  return isInStock(product) && product.stock <= LOW_STOCK_THRESHOLD;
}

export function getProductBadge(product: Product): ProductBadge | undefined {
  if (!isInStock(product)) return "Out of Stock";
  if (isLowStock(product)) return "Limited Stock";
  if (product.isNew) return "New";
  if (product.isBestSeller) return "Best Seller";
  if (isOnSale(product)) return "Sale";
  return undefined;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function createEmptyFilterValues(): FilterValues {
  return { category: [], color: [], material: [], occasion: [], special: [] };
}

export function hasActiveFilters(filters: FilterValues): boolean {
  return (
    filters.category.length > 0 ||
    filters.color.length > 0 ||
    filters.material.length > 0 ||
    filters.occasion.length > 0 ||
    filters.special.length > 0 ||
    filters.rating !== undefined ||
    filters.availability !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  );
}

function matchesSpecial(
  product: Product,
  special: FilterValues["special"],
): boolean {
  if (special.length === 0) return true;
  return special.some((value) => {
    if (value === "new") return product.isNew;
    if (value === "best-seller") return product.isBestSeller;
    return isOnSale(product);
  });
}

export function filterProducts(
  products: Product[],
  filters: FilterValues,
): Product[] {
  return products.filter((product) => {
    if (
      filters.category.length > 0 &&
      !filters.category.includes(product.categorySlug)
    ) {
      return false;
    }
    if (filters.color.length > 0 && !filters.color.includes(product.color)) {
      return false;
    }
    if (
      filters.material.length > 0 &&
      !filters.material.includes(product.material)
    ) {
      return false;
    }
    if (
      filters.occasion.length > 0 &&
      !filters.occasion.includes(product.occasion)
    ) {
      return false;
    }
    if (!matchesSpecial(product, filters.special)) {
      return false;
    }
    if (filters.rating !== undefined && product.rating < filters.rating) {
      return false;
    }
    if (filters.availability === "in-stock" && !isInStock(product)) {
      return false;
    }
    if (filters.availability === "out-of-stock" && isInStock(product)) {
      return false;
    }
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], sortKey: SortKey): Product[] {
  const sorted = [...products];

  switch (sortKey) {
    case "newest":
      return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "best-selling":
      return sorted.sort((a, b) => {
        if (a.isBestSeller !== b.isBestSeller)
          return Number(b.isBestSeller) - Number(a.isBestSeller);
        return b.reviewsCount - a.reviewsCount;
      });
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewsCount - a.reviewsCount;
      });
    case "discount":
      return sorted.sort(
        (a, b) =>
          (getDiscountPercentage(b) ?? 0) - (getDiscountPercentage(a) ?? 0),
      );
    case "featured":
    default:
      return sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
}

export function searchProducts(
  products: Product[],
  rawQuery: string,
): Product[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const nameMatches: Product[] = [];
  const otherMatches: Product[] = [];

  for (const product of products) {
    const category = getCategoryBySlug(product.categorySlug);
    const nameMatch = product.name.toLowerCase().includes(query);
    const otherMatch =
      nameMatch ||
      (category?.name.toLowerCase().includes(query) ?? false) ||
      product.material.toLowerCase().includes(query) ||
      product.occasion.toLowerCase().includes(query) ||
      product.color.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));

    if (nameMatch) {
      nameMatches.push(product);
    } else if (otherMatch) {
      otherMatches.push(product);
    }
  }

  return [...nameMatches, ...otherMatches];
}

function parseListParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseFilterValues(searchParams: URLSearchParams): FilterValues {
  const rating = searchParams.get("rating");
  const availability = searchParams.get("availability");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  return {
    category: parseListParam(searchParams.get("category")),
    color: parseListParam(searchParams.get("color")),
    material: parseListParam(searchParams.get("material")),
    occasion: parseListParam(searchParams.get("occasion")),
    special: parseListParam(
      searchParams.get("special"),
    ) as FilterValues["special"],
    rating: rating ? Number(rating) : undefined,
    availability:
      availability === "in-stock" || availability === "out-of-stock"
        ? availability
        : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };
}

export function parseSortKey(value: string | null): SortKey {
  const validKeys: SortKey[] = [
    "featured",
    "newest",
    "best-selling",
    "price-low",
    "price-high",
    "rating",
    "discount",
  ];
  return validKeys.includes(value as SortKey) ? (value as SortKey) : "featured";
}

export function buildFilterSearchParams(
  filters: FilterValues,
  extra: Record<string, string | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category.length > 0)
    params.set("category", filters.category.join(","));
  if (filters.color.length > 0) params.set("color", filters.color.join(","));
  if (filters.material.length > 0)
    params.set("material", filters.material.join(","));
  if (filters.occasion.length > 0)
    params.set("occasion", filters.occasion.join(","));
  if (filters.special.length > 0)
    params.set("special", filters.special.join(","));
  if (filters.rating !== undefined)
    params.set("rating", String(filters.rating));
  if (filters.availability) params.set("availability", filters.availability);
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }

  return params;
}

export function getRelatedProducts(
  pool: Product[],
  product: Product,
  limit = 4,
): Product[] {
  const scored = pool
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.categorySlug === product.categorySlug) score += 3;
      if (candidate.occasion === product.occasion) score += 2;
      if (candidate.material === product.material) score += 1;
      score += candidate.tags.filter((tag) =>
        product.tags.includes(tag),
      ).length;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.candidate.rating - a.candidate.rating,
    );

  const related = scored.map((entry) => entry.candidate).slice(0, limit);

  if (related.length < limit) {
    const fallback = pool.filter(
      (candidate) =>
        candidate.id !== product.id && !related.includes(candidate),
    );
    related.push(...fallback.slice(0, limit - related.length));
  }

  return related;
}

export function getRecentlyViewedMock(
  product: Product,
  exclude: Product[] = [],
): Product[] {
  const excludedIds = new Set([product.id, ...exclude.map((item) => item.id)]);
  return allProducts
    .filter((candidate) => !excludedIds.has(candidate.id))
    .slice(0, 4);
}
