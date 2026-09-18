import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/services/productService";
import { getCategories } from "@/lib/services/categoryService";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
  { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
  { url: `${baseUrl}/products`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${baseUrl}/new-arrivals`, changeFrequency: "daily", priority: 0.7 },
  { url: `${baseUrl}/best-sellers`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${baseUrl}/faqs`, changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt
        ? new Date(category.updatedAt)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
