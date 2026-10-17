import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { publishFacebookPhotoPost } from "@/lib/meta/facebookPublisher";
import {
  publishInstagramPost,
  publishInstagramStory,
} from "@/lib/meta/instagramPublisher";
import { getPageAccessToken } from "@/lib/meta/graphClient";
import {
  findCatalogProductId,
  triggerCatalogFeedSync,
} from "@/lib/meta/catalogClient";
import {
  buildFacebookCaption,
  buildInstagramCaption,
} from "@/lib/meta/captionBuilder";
import type {
  ProductSocialPostRecord,
  SocialMediaSettings,
  SocialMediaSettingsInput,
  SocialPlatformStatus,
} from "@/types/socialMedia";
import type { PaginationResult } from "@/types/admin";
import type { Database } from "@/types/supabase";

type SocialDbClient = SupabaseClient<Database>;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

interface PlatformResult {
  status: SocialPlatformStatus;
  id?: string;
  error?: string;
}

interface ProductRow {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  stock: number;
  force_unavailable: boolean;
  categories: { name: string } | null;
  product_images: { image_url: string; display_order: number }[];
  product_variants: { option_type: string; option_value: string; is_active: boolean }[];
}

async function runFacebook(
  settings: { facebook_page_id: string | null; facebook_access_token: string | null },
  imageUrl: string,
  caption: string,
  productId: string | undefined,
): Promise<PlatformResult> {
  if (!settings.facebook_page_id || !settings.facebook_access_token) {
    return { status: "skipped" };
  }
  try {
    const pageAccessToken = await getPageAccessToken(
      settings.facebook_page_id,
      settings.facebook_access_token,
    );
    const { postId } = await publishFacebookPhotoPost({
      pageId: settings.facebook_page_id,
      accessToken: pageAccessToken,
      imageUrl,
      caption,
      productId,
    });
    return { status: "success", id: postId };
  } catch (error) {
    console.error("[socialPostingService.runFacebook] failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Facebook post failed.",
    };
  }
}

async function runInstagram(
  settings: {
    instagram_business_account_id: string | null;
    facebook_access_token: string | null;
  },
  imageUrl: string,
  caption: string,
  productId: string | undefined,
): Promise<PlatformResult> {
  if (!settings.instagram_business_account_id || !settings.facebook_access_token) {
    return { status: "skipped" };
  }
  try {
    const { mediaId } = await publishInstagramPost({
      igUserId: settings.instagram_business_account_id,
      accessToken: settings.facebook_access_token,
      imageUrl,
      caption,
      productId,
    });
    return { status: "success", id: mediaId };
  } catch (error) {
    console.error("[socialPostingService.runInstagram] failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Instagram post failed.",
    };
  }
}

async function runInstagramStory(
  settings: {
    instagram_business_account_id: string | null;
    facebook_access_token: string | null;
  },
  imageUrl: string,
): Promise<PlatformResult> {
  if (!settings.instagram_business_account_id || !settings.facebook_access_token) {
    return { status: "skipped" };
  }
  try {
    const { mediaId } = await publishInstagramStory({
      igUserId: settings.instagram_business_account_id,
      accessToken: settings.facebook_access_token,
      imageUrl,
    });
    return { status: "success", id: mediaId };
  } catch (error) {
    console.error("[socialPostingService.runInstagramStory] failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Instagram Story post failed.",
    };
  }
}

/**
 * Shared implementation behind publishProductToSocialMedia() below. Takes
 * the Supabase client as a parameter so it can run two ways: with a
 * session-bound admin client (the original createProduct / updateProduct /
 * setProductActive call sites, unchanged), or with the service-role client
 * from processNextScheduledRepost() below, which runs from a cron request
 * with no admin session for RLS to check -- same reasoning as the inbound
 * WhatsApp webhook's use of getSupabaseServiceRoleClient().
 */
async function publishProductToSocialMediaCore(
  supabase: SocialDbClient,
  productId: string,
  options: { forceRepost?: boolean } = {},
): Promise<void> {
  {
    const { data: settings } = await supabase
      .from("social_media_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (
      !settings ||
      !settings.auto_post_enabled ||
      (!settings.facebook_enabled && !settings.instagram_enabled)
    ) {
      return;
    }

    let existingRetryCount = 0;
    if (!options.forceRepost) {
      const { data: existing } = await supabase
        .from("product_social_posts")
        .select("id")
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) return;
    } else {
      const { data: existing } = await supabase
        .from("product_social_posts")
        .select("retry_count")
        .eq("product_id", productId)
        .maybeSingle();
      existingRetryCount = existing?.retry_count ?? 0;
    }

    const { data: product } = await supabase
      .from("products")
      .select(
        "id, sku, name, slug, short_description, price, stock, force_unavailable, categories(name), product_images(image_url, display_order), product_variants(option_type, option_value, is_active)",
      )
      .eq("id", productId)
      .maybeSingle();

    const typedProduct = product as unknown as ProductRow | null;
    if (!typedProduct) return;

    if (typedProduct.force_unavailable || typedProduct.stock <= 0) {
      return;
    }

    const image = [...typedProduct.product_images].sort(
      (a, b) => a.display_order - b.display_order,
    )[0];
    if (!image) {
      console.error(
        `[socialPostingService.publishProductToSocialMedia] product ${productId} has no image, skipping.`,
      );
      return;
    }

    const productUrl = `${baseUrl}/product/${typedProduct.slug}`;
    const colorOptions = typedProduct.product_variants
      .filter((v) => v.option_type === "color" && v.is_active)
      .map((v) => v.option_value);

    const captionInput = {
      name: typedProduct.name,
      shortDescription: typedProduct.short_description,
      price: typedProduct.price,
      productUrl,
      categoryName: typedProduct.categories?.name,
      colorOptions,
    };

    // Best-effort catalog lookup, shared by both platforms since they use
    // the same catalog. Meta only re-fetches the product feed on its own
    // schedule, so a just-created product may not be in the catalog yet --
    // that's a normal "not tagged this time" outcome, not a failure, and
    // "Post Again" will naturally pick up the tag once it syncs.
    let catalogProductId: string | undefined;
    if (
      settings.product_tagging_enabled &&
      settings.facebook_catalog_id &&
      settings.facebook_access_token &&
      typedProduct.sku
    ) {
      catalogProductId =
        (await findCatalogProductId(
          settings.facebook_catalog_id,
          typedProduct.sku,
          settings.facebook_access_token,
        )) ?? undefined;
    }

    const [facebookResult, instagramResult, instagramStoryResult] = await Promise.all([
      settings.facebook_enabled
        ? runFacebook(
            settings,
            image.image_url,
            buildFacebookCaption(captionInput),
            catalogProductId,
          )
        : Promise.resolve<PlatformResult>({ status: "skipped" }),
      settings.instagram_enabled
        ? runInstagram(
            settings,
            image.image_url,
            buildInstagramCaption(captionInput),
            catalogProductId,
          )
        : Promise.resolve<PlatformResult>({ status: "skipped" }),
      // Rides on the same Instagram toggle as the feed post above -- Meta's
      // Content Publishing API doesn't charge per call, so there's no cost
      // reason to post one without the other, and a separate settings
      // toggle would just be more admin UI for no real benefit.
      settings.instagram_enabled
        ? runInstagramStory(settings, image.image_url)
        : Promise.resolve<PlatformResult>({ status: "skipped" }),
    ]);

    const anySuccess =
      facebookResult.status === "success" ||
      instagramResult.status === "success" ||
      instagramStoryResult.status === "success";

    const { error: upsertError } = await supabase
      .from("product_social_posts")
      .upsert(
        {
          product_id: productId,
          facebook_status: facebookResult.status,
          facebook_post_id: facebookResult.id ?? null,
          facebook_error: facebookResult.error ?? null,
          instagram_status: instagramResult.status,
          instagram_media_id: instagramResult.id ?? null,
          instagram_error: instagramResult.error ?? null,
          instagram_story_status: instagramStoryResult.status,
          instagram_story_media_id: instagramStoryResult.id ?? null,
          instagram_story_error: instagramStoryResult.error ?? null,
          posted_at: anySuccess ? new Date().toISOString() : null,
          retry_count: options.forceRepost ? existingRetryCount + 1 : 0,
        },
        { onConflict: "product_id" },
      );

    if (upsertError) {
      console.error(
        "[socialPostingService.publishProductToSocialMedia] failed to save result:",
        upsertError,
      );
    }
  }
}

/**
 * Publishes a Facebook Page post and an Instagram post for a product, and
 * records the outcome. Never throws -- this is called from createProduct /
 * updateProduct / setProductActive and must never break a product save.
 *
 * Dedup relies entirely on the product_social_posts.unique(product_id)
 * lookup in the core function above rather than the caller diffing old/new
 * is_active: it's the one thing all three call sites can rely on
 * uniformly, for free.
 */
export async function publishProductToSocialMedia(
  productId: string,
  options: { forceRepost?: boolean } = {},
): Promise<void> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    await publishProductToSocialMediaCore(supabase, productId, options);
  } catch (error) {
    console.error(
      "[socialPostingService.publishProductToSocialMedia] failed:",
      error,
    );
  }
}

/** How many queued price-change reposts the scheduled worker will publish
 * per day, across all products combined -- the hard cap that keeps price-
 * change announcements trickling out gradually instead of bursting. Counted
 * against product_social_repost_queue rows actually posted "today", not
 * against the separate, unthrottled immediate-post flow above. */
const DAILY_REPOST_CAP = 3;

/**
 * Queues a product for a throttled repost after its price changes. Purely
 * additive: unlike publishProductToSocialMedia(), this never posts anything
 * itself -- it only adds a row for processNextScheduledRepost() (invoked by
 * the /api/cron/social-repost route) to pick up later. Call-site decides
 * whether the price actually changed; this just records the request.
 */
export async function enqueuePriceChangeRepost(productId: string): Promise<void> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("product_social_repost_queue")
      .insert({ product_id: productId, reason: "price_change" });

    // 23505 = unique_violation: a repost for this product is already
    // pending, which is fine -- the next scheduled run will cover this
    // latest price too, no need for a second queue row.
    if (error && error.code !== "23505") {
      console.error(
        "[socialPostingService.enqueuePriceChangeRepost] failed:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[socialPostingService.enqueuePriceChangeRepost] failed:",
      error,
    );
  }
}

interface ScheduledRepostResult {
  posted: boolean;
  productId?: string;
  reason?: "daily_cap_reached" | "queue_empty";
}

/**
 * Called from /api/cron/social-repost, which authenticates the request with
 * a shared secret rather than an admin session -- so this runs with the
 * service-role client (bypassing RLS), the same pattern the inbound
 * WhatsApp webhook uses for the same reason. Posts at most one random
 * pending product per call, and refuses once DAILY_REPOST_CAP has already
 * been posted "today", so calling this endpoint on a schedule (3x/day via
 * .github/workflows/social-repost-schedule.yml) naturally spreads
 * price-change posts out instead of bursting them, with the cap as a
 * backstop if it's ever called more often than that.
 */
export async function processNextScheduledRepost(): Promise<ScheduledRepostResult> {
  const supabase = getSupabaseServiceRoleClient();

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const { count: postedToday } = await supabase
    .from("product_social_repost_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "posted")
    .gte("processed_at", startOfToday.toISOString());

  if ((postedToday ?? 0) >= DAILY_REPOST_CAP) {
    return { posted: false, reason: "daily_cap_reached" };
  }

  // Fetches the oldest pending rows (bounded, since this queue is small --
  // a handful of pending rows at most between runs) and picks one at
  // random client-side, rather than always posting strict-FIFO.
  const { data: pendingRows } = await supabase
    .from("product_social_repost_queue")
    .select("id, product_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(20);

  if (!pendingRows || pendingRows.length === 0) {
    return { posted: false, reason: "queue_empty" };
  }

  const picked =
    pendingRows[Math.floor(Math.random() * pendingRows.length)];

  try {
    await publishProductToSocialMediaCore(supabase, picked.product_id, {
      forceRepost: true,
    });
  } catch (error) {
    console.error(
      "[socialPostingService.processNextScheduledRepost] publish failed:",
      error,
    );
  }

  // Marked "posted" regardless of the underlying Graph API outcome (visible
  // per-platform in product_social_posts via the admin's existing history
  // list) -- a queue row's job is just "don't try this product again every
  // run", not to track success itself.
  await supabase
    .from("product_social_repost_queue")
    .update({ status: "posted", processed_at: new Date().toISOString() })
    .eq("id", picked.id);

  return { posted: true, productId: picked.product_id };
}

export async function retryProductSocialPost(
  productId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  await publishProductToSocialMedia(productId, { forceRepost: true });
  return {};
}

/**
 * Reads back the per-platform outcome of the most recent publish attempt
 * for a product, so a caller that just triggered one (e.g. the manual
 * "Share" button on the products list) can tell the admin what happened.
 */
export async function getProductSocialPostStatus(productId: string): Promise<{
  facebookStatus?: SocialPlatformStatus;
  instagramStatus?: SocialPlatformStatus;
  facebookError?: string | null;
  instagramError?: string | null;
}> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("product_social_posts")
    .select("facebook_status, instagram_status, facebook_error, instagram_error")
    .eq("product_id", productId)
    .maybeSingle();

  if (!data) return {};
  return {
    facebookStatus: data.facebook_status,
    instagramStatus: data.instagram_status,
    facebookError: data.facebook_error,
    instagramError: data.instagram_error,
  };
}

export async function getSocialMediaSettings(): Promise<SocialMediaSettings> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("social_media_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return {
    facebookPageId: data?.facebook_page_id ?? "",
    facebookAccessToken: "",
    hasFacebookAccessToken: !!data?.facebook_access_token,
    facebookEnabled: data?.facebook_enabled ?? false,
    instagramBusinessAccountId: data?.instagram_business_account_id ?? "",
    instagramEnabled: data?.instagram_enabled ?? false,
    autoPostEnabled: data?.auto_post_enabled ?? false,
    facebookConnectedAt: data?.facebook_connected_at ?? null,
    instagramConnectedAt: data?.instagram_connected_at ?? null,
    facebookCatalogId: data?.facebook_catalog_id ?? "",
    facebookProductFeedId: data?.facebook_product_feed_id ?? "",
    productTaggingEnabled: data?.product_tagging_enabled ?? false,
  };
}

/**
 * Returns the raw access token for server-only use (e.g. a "Test
 * Connection" action). Deliberately separate from getSocialMediaSettings(),
 * which never exposes the real token so it can safely be passed to a
 * client component as initial form state.
 */
export async function getFacebookAccessTokenForServerUse(): Promise<string | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("social_media_settings")
    .select("facebook_access_token")
    .limit(1)
    .maybeSingle();
  return data?.facebook_access_token ?? null;
}

export async function saveSocialMediaSettings(
  input: SocialMediaSettingsInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("social_media_settings")
    .select("id, facebook_access_token, facebook_connected_at, instagram_connected_at")
    .limit(1)
    .maybeSingle();

  const pageId = input.facebookPageId.trim() || null;
  const igAccountId = input.instagramBusinessAccountId.trim() || null;
  // A blank token field means "keep the existing token" -- the real value
  // is never round-tripped back into the form, so an empty submit must not
  // wipe out a token the admin didn't intend to change.
  const token = input.facebookAccessToken.trim() || existing?.facebook_access_token || null;

  const payload = {
    facebook_page_id: pageId,
    facebook_access_token: token,
    facebook_enabled: input.facebookEnabled,
    instagram_business_account_id: igAccountId,
    instagram_enabled: input.instagramEnabled,
    auto_post_enabled: input.autoPostEnabled,
    facebook_connected_at: pageId
      ? (existing?.facebook_connected_at ?? new Date().toISOString())
      : null,
    instagram_connected_at: igAccountId
      ? (existing?.instagram_connected_at ?? new Date().toISOString())
      : null,
    facebook_catalog_id: input.facebookCatalogId.trim() || null,
    facebook_product_feed_id: input.facebookProductFeedId.trim() || null,
    product_tagging_enabled: input.productTaggingEnabled,
  };

  const { error } = existing
    ? await supabase
        .from("social_media_settings")
        .update(payload)
        .eq("id", existing.id)
    : await supabase.from("social_media_settings").insert(payload);

  if (error) {
    console.error("[socialPostingService.saveSocialMediaSettings] failed:", error);
    return { error: "Unable to save social media settings right now." };
  }
  return {};
}

export async function syncProductFeed(): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("social_media_settings")
    .select("facebook_product_feed_id, facebook_access_token")
    .limit(1)
    .maybeSingle();

  if (!data?.facebook_product_feed_id || !data.facebook_access_token) {
    return { error: "Save a Product Feed ID and access token first." };
  }

  return triggerCatalogFeedSync(
    data.facebook_product_feed_id,
    `${baseUrl}/product-feed.xml`,
    data.facebook_access_token,
  );
}

interface ProductSocialPostRow {
  id: string;
  product_id: string;
  facebook_post_id: string | null;
  instagram_media_id: string | null;
  instagram_story_media_id: string | null;
  facebook_status: SocialPlatformStatus;
  instagram_status: SocialPlatformStatus;
  instagram_story_status: SocialPlatformStatus;
  facebook_error: string | null;
  instagram_error: string | null;
  instagram_story_error: string | null;
  posted_at: string | null;
  retry_count: number;
  created_at: string;
  products: { name: string; slug: string } | null;
}

function mapProductSocialPostRow(
  row: ProductSocialPostRow,
): ProductSocialPostRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? null,
    productSlug: row.products?.slug ?? null,
    facebookPostId: row.facebook_post_id,
    instagramMediaId: row.instagram_media_id,
    instagramStoryMediaId: row.instagram_story_media_id,
    facebookStatus: row.facebook_status,
    instagramStatus: row.instagram_status,
    instagramStoryStatus: row.instagram_story_status,
    facebookError: row.facebook_error,
    instagramError: row.instagram_error,
    instagramStoryError: row.instagram_story_error,
    postedAt: row.posted_at,
    retryCount: row.retry_count,
    createdAt: row.created_at,
  };
}

export async function listProductSocialPosts(
  page: number,
  pageSize: number,
): Promise<PaginationResult<ProductSocialPostRecord>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("product_social_posts")
    .select("*, products(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[socialPostingService.listProductSocialPosts] failed:", error);
    throw new Error("Unable to load social posting history right now.");
  }

  const items = (data ?? []).map((row) =>
    mapProductSocialPostRow(row as unknown as ProductSocialPostRow),
  );
  const totalCount = count ?? 0;
  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}
