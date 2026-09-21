import { unstable_cache } from "next/cache";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { siteConfig } from "@/constants/site";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export interface ProductFeedItem {
  sku: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  available: boolean;
  price: number;
  categoryName: string | null;
}

interface ProductFeedRow {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  stock: number;
  force_unavailable: boolean;
  categories: { name: string } | null;
  product_images: { image_url: string; display_order: number }[];
}

/**
 * Public product data for the Facebook/Instagram Commerce catalog feed.
 * Deliberately a separate query from productService.getProducts(): that
 * path drops sku/force_unavailable entirely when mapping to the public
 * Product type, but a feed needs both (sku as the catalog retailer_id,
 * force_unavailable to compute real availability).
 *
 * Cached: this feed is polled by Meta/Google crawlers on their own schedule,
 * not by a person waiting on a page load, so there's no reason to hit the
 * database on every crawl. Tagged so admin product edits and stock changes
 * still invalidate it (see CACHE_TAGS.products usages).
 */
const getProductFeedItemsUncached = unstable_cache(
  async (): Promise<ProductFeedItem[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, name, slug, description, short_description, price, stock, force_unavailable, categories(name), product_images(image_url, display_order)",
      )
      .eq("is_active", true);

    if (error) {
      console.error("[productFeedService.getProductFeedItems] failed:", error);
      throw new Error("Unable to load the product feed right now.");
    }

    const rows = (data ?? []) as unknown as ProductFeedRow[];

    return rows
      .filter((row) => !!row.sku)
      .map((row) => {
        const image = [...row.product_images].sort(
          (a, b) => a.display_order - b.display_order,
        )[0];
        const description = (row.short_description || row.description).slice(
          0,
          5000,
        );

        return {
          sku: row.sku as string,
          title: row.name,
          description,
          link: `${baseUrl}/product/${row.slug}`,
          imageUrl: image?.image_url ?? "",
          available: !row.force_unavailable && row.stock > 0,
          price: row.price,
          categoryName: row.categories?.name ?? null,
        };
      })
      .filter((item) => !!item.imageUrl);
  },
  ["product-feed:items"],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.productFeed], revalidate: 600 },
);

export async function getProductFeedItems(): Promise<ProductFeedItem[]> {
  return getProductFeedItemsUncached();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildProductFeedXml(items: ProductFeedItem[]): string {
  const entries = items
    .map(
      (item) => `  <item>
    <g:id>${escapeXml(item.sku)}</g:id>
    <title>${escapeXml(item.title)}</title>
    <description>${escapeXml(item.description)}</description>
    <link>${escapeXml(item.link)}</link>
    <g:image_link>${escapeXml(item.imageUrl)}</g:image_link>
    <g:availability>${item.available ? "in stock" : "out of stock"}</g:availability>
    <g:price>${item.price}.00 ${siteConfig.currency}</g:price>
    <g:brand>${escapeXml(siteConfig.name)}</g:brand>
    <g:condition>new</g:condition>${
      item.categoryName
        ? `\n    <g:product_type>${escapeXml(item.categoryName)}</g:product_type>`
        : ""
    }
  </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(siteConfig.name)} Product Feed</title>
  <link>${baseUrl}</link>
  <description>Product catalog feed for Facebook and Instagram Shop</description>
${entries}
</channel>
</rss>
`;
}
