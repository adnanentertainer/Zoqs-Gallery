import {
  buildProductFeedXml,
  getProductFeedItems,
} from "@/lib/services/productFeedService";

// Meta's product-feed tags (g:price, g:availability, ...) don't fit the
// typed MetadataRoute.Sitemap shape sitemap.ts uses, so this is a plain
// Route Handler returning hand-built XML instead of the sitemap.ts
// convention.
export async function GET() {
  const items = await getProductFeedItems();
  const xml = buildProductFeedXml(items);
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
