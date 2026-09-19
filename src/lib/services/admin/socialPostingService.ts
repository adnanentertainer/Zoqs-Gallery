import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { publishFacebookPhotoPost } from "@/lib/meta/facebookPublisher";
import { publishInstagramPost } from "@/lib/meta/instagramPublisher";
import { getPageAccessToken } from "@/lib/meta/graphClient";
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
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  categories: { name: string } | null;
  product_images: { image_url: string; display_order: number }[];
  product_variants: { option_type: string; option_value: string; is_active: boolean }[];
}

async function runFacebook(
  settings: { facebook_page_id: string | null; facebook_access_token: string | null },
  imageUrl: string,
  caption: string,
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

/**
 * Publishes a Facebook Page post and an Instagram post for a product, and
 * records the outcome. Never throws -- this is called from createProduct /
 * updateProduct / setProductActive and must never break a product save.
 *
 * Dedup relies entirely on the product_social_posts.unique(product_id)
 * lookup below rather than the caller diffing old/new is_active: it's the
 * one thing all three call sites can rely on uniformly, for free.
 */
export async function publishProductToSocialMedia(
  productId: string,
  options: { forceRepost?: boolean } = {},
): Promise<void> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();

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
        "id, name, slug, short_description, price, categories(name), product_images(image_url, display_order), product_variants(option_type, option_value, is_active)",
      )
      .eq("id", productId)
      .maybeSingle();

    const typedProduct = product as unknown as ProductRow | null;
    if (!typedProduct) return;

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

    const [facebookResult, instagramResult] = await Promise.all([
      settings.facebook_enabled
        ? runFacebook(settings, image.image_url, buildFacebookCaption(captionInput))
        : Promise.resolve<PlatformResult>({ status: "skipped" }),
      settings.instagram_enabled
        ? runInstagram(settings, image.image_url, buildInstagramCaption(captionInput))
        : Promise.resolve<PlatformResult>({ status: "skipped" }),
    ]);

    const anySuccess =
      facebookResult.status === "success" || instagramResult.status === "success";

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
  } catch (error) {
    console.error(
      "[socialPostingService.publishProductToSocialMedia] failed:",
      error,
    );
  }
}

export async function retryProductSocialPost(
  productId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  await publishProductToSocialMedia(productId, { forceRepost: true });
  return {};
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

interface ProductSocialPostRow {
  id: string;
  product_id: string;
  facebook_post_id: string | null;
  instagram_media_id: string | null;
  facebook_status: SocialPlatformStatus;
  instagram_status: SocialPlatformStatus;
  facebook_error: string | null;
  instagram_error: string | null;
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
    facebookStatus: row.facebook_status,
    instagramStatus: row.instagram_status,
    facebookError: row.facebook_error,
    instagramError: row.instagram_error,
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
