/**
 * Shared `unstable_cache`/`revalidateTag` tag names for public storefront
 * data. Centralized so a service that reads a table and the admin service
 * that writes to it always agree on the tag name — a typo in either place
 * would otherwise silently break cache invalidation (admin saves that never
 * show up on the storefront).
 */
export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  reviews: "reviews",
  socialPosts: "social-posts",
  siteSettings: "site-settings",
  productFeed: "product-feed",
} as const;
