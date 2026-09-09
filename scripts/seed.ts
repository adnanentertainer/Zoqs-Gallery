/**
 * Seeds Supabase with ZOQ's Gallery's existing mock catalog (categories,
 * products, images, variants, reviews, site settings) so the Supabase-backed
 * app renders identically to the mock-data version.
 *
 * Run locally only, never in a deployed environment or CI job that exposes
 * secrets:
 *
 *   npm run seed
 *
 * Requires a .env.local (see .env.example) with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service_role — bypasses RLS, server/local only)
 *
 * The service_role key is used ONLY in this file. It is never imported by
 * src/lib/supabase/client.ts or server.ts, and must never reach the browser.
 *
 * Safe to re-run: categories/products/settings are upserted by their unique
 * slug/key (so ids stay stable across runs), and each product's images,
 * variants and reviews are deleted and re-inserted from the current mock
 * data so re-running never accumulates duplicates.
 */

import { createClient } from "@supabase/supabase-js";
import { categories as mockCategories } from "../src/data/categories";
import { allProducts as mockProducts } from "../src/data/products";
import { reviews as mockReviews } from "../src/data/reviews";
import { getProductBadge, isOnSale } from "../src/lib/products";
import { siteConfig } from "../src/constants/site";
import type { Database } from "../src/types/supabase";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local not found — fall back to whatever is already in process.env
  // (e.g. exported in the shell). Validated below regardless.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add both to .env.local (see .env.example) before running `npm run seed`.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seedCategories(): Promise<Map<string, string>> {
  const rows = mockCategories.map((category, index) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    image_url: category.image,
    is_active: true,
    display_order: index,
  }));

  const { data, error } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");

  if (error) throw new Error(`Seeding categories failed: ${error.message}`);

  console.log(`Seeded ${data.length} categories.`);
  return new Map(data.map((row) => [row.slug, row.id]));
}

async function seedProducts(
  categoryIdBySlug: Map<string, string>,
): Promise<Map<string, string>> {
  const mockIdToUuid = new Map<string, string>();

  for (const product of mockProducts) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      console.warn(
        `Skipping "${product.name}" — unknown category slug "${product.categorySlug}".`,
      );
      continue;
    }

    const { data: productRow, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          name: product.name,
          slug: product.slug,
          description: product.description,
          category_id: categoryId,
          price: product.price,
          original_price: product.originalPrice ?? null,
          badge: getProductBadge(product) ?? null,
          is_new: product.isNew,
          is_best_seller: product.isBestSeller,
          is_featured: product.isFeatured,
          is_sale: isOnSale(product),
          stock: product.stock,
          material: product.material,
          color: product.color,
          occasion: product.occasion,
          weight: product.weight ?? null,
          dimensions: product.dimensions ?? null,
          care_instructions: product.careInstructions ?? null,
          tags: product.tags,
          is_active: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (productError) {
      throw new Error(
        `Seeding product "${product.name}" failed: ${productError.message}`,
      );
    }

    const productId = productRow.id;
    mockIdToUuid.set(product.id, productId);

    // Images: delete-then-insert keeps re-runs idempotent (no unique key to upsert on).
    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);
    if (deleteImagesError) {
      throw new Error(
        `Clearing images for "${product.name}" failed: ${deleteImagesError.message}`,
      );
    }

    const imageRows = product.images.map((imageUrl, index) => ({
      product_id: productId,
      image_url: imageUrl,
      alt_text: `${product.name} — image ${index + 1}`,
      display_order: index,
    }));
    if (imageRows.length > 0) {
      const { error: insertImagesError } = await supabase
        .from("product_images")
        .insert(imageRows);
      if (insertImagesError) {
        throw new Error(
          `Inserting images for "${product.name}" failed: ${insertImagesError.message}`,
        );
      }
    }

    // Variants: same delete-then-insert idempotency approach.
    const { error: deleteVariantsError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (deleteVariantsError) {
      throw new Error(
        `Clearing variants for "${product.name}" failed: ${deleteVariantsError.message}`,
      );
    }

    const variantRows = (product.variants ?? []).flatMap((group) =>
      group.options.map((option) => ({
        product_id: productId,
        name: group.label,
        option_type: group.type,
        option_value: option.value,
        price_adjustment:
          option.priceOverride !== undefined
            ? option.priceOverride - product.price
            : null,
        stock: option.inStock === false ? 0 : null,
        sku: `${product.slug}-${group.type}-${option.value.toLowerCase().replace(/\s+/g, "-")}`,
        is_active: true,
      })),
    );
    if (variantRows.length > 0) {
      const { error: insertVariantsError } = await supabase
        .from("product_variants")
        .insert(variantRows);
      if (insertVariantsError) {
        throw new Error(
          `Inserting variants for "${product.name}" failed: ${insertVariantsError.message}`,
        );
      }
    }
  }

  console.log(
    `Seeded ${mockProducts.length} products (with images and variants).`,
  );
  return mockIdToUuid;
}

async function seedReviews(mockIdToUuid: Map<string, string>): Promise<void> {
  const productIds = [...new Set(mockReviews.map((review) => review.productId))]
    .map((mockId) => mockIdToUuid.get(mockId))
    .filter((id): id is string => Boolean(id));

  if (productIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .in("product_id", productIds);
    if (deleteError) {
      throw new Error(
        `Clearing existing reviews failed: ${deleteError.message}`,
      );
    }
  }

  const rows = mockReviews.flatMap((review) => {
    const productId = mockIdToUuid.get(review.productId);
    if (!productId) {
      console.warn(
        `Skipping review "${review.id}" — unknown product id "${review.productId}".`,
      );
      return [];
    }
    return [
      {
        product_id: productId,
        customer_name: review.customerName,
        rating: review.rating,
        review: review.reviewText,
        review_date: review.date,
        is_verified_purchase: review.verifiedPurchase,
        is_approved: true,
      },
    ];
  });

  const { error } = await supabase.from("reviews").insert(rows);
  if (error) throw new Error(`Seeding reviews failed: ${error.message}`);

  console.log(`Seeded ${rows.length} reviews.`);
}

async function seedSiteSettings(): Promise<void> {
  const rows = [
    {
      key: "free_shipping_threshold",
      value: siteConfig.freeShippingThreshold,
      description: "Order subtotal (PKR) at which shipping becomes free.",
    },
    {
      key: "flat_shipping_cost",
      value: siteConfig.flatShippingCost,
      description:
        "Flat shipping cost (PKR) charged below the free shipping threshold.",
    },
    { key: "site_name", value: siteConfig.name, description: "Brand name." },
    {
      key: "site_tagline",
      value: siteConfig.tagline,
      description: "Brand tagline.",
    },
    {
      key: "announcement_text",
      value: siteConfig.announcement,
      description: "Top announcement bar text.",
    },
    {
      key: "currency",
      value: siteConfig.currency,
      description: "Storefront currency code.",
    },
    {
      key: "country",
      value: siteConfig.country,
      description: "Storefront country.",
    },
    {
      key: "social_links",
      value: siteConfig.socialLinks,
      description: "Footer/header social links.",
    },
  ];

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) throw new Error(`Seeding site settings failed: ${error.message}`);

  console.log(`Seeded ${rows.length} site settings.`);
}

async function main() {
  console.log(`Seeding Supabase project at ${url} ...`);
  const categoryIdBySlug = await seedCategories();
  const mockIdToUuid = await seedProducts(categoryIdBySlug);
  await seedReviews(mockIdToUuid);
  await seedSiteSettings();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
