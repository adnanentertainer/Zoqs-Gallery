import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { publishFacebookReel } from "@/lib/meta/facebookPublisher";
import { publishInstagramReel } from "@/lib/meta/instagramPublisher";
import { getPageAccessToken } from "@/lib/meta/graphClient";
import { findCatalogProductId } from "@/lib/meta/catalogClient";
import type {
  ProductReelInput,
  ProductReelRecord,
  SocialPlatformStatus,
} from "@/types/socialMedia";
import type { PaginationResult } from "@/types/admin";

interface PlatformResult {
  status: SocialPlatformStatus;
  id?: string;
  error?: string;
}

interface SettingsRow {
  facebook_page_id: string | null;
  facebook_access_token: string | null;
  facebook_enabled: boolean;
  instagram_business_account_id: string | null;
  instagram_enabled: boolean;
  facebook_catalog_id: string | null;
  product_tagging_enabled: boolean;
}

async function runFacebookReel(
  settings: SettingsRow,
  videoUrl: string,
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
    const { videoId } = await publishFacebookReel({
      pageId: settings.facebook_page_id,
      accessToken: pageAccessToken,
      videoUrl,
      caption,
      productId,
    });
    return { status: "success", id: videoId };
  } catch (error) {
    console.error("[reelPostingService.runFacebookReel] failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Facebook Reel post failed.",
    };
  }
}

async function runInstagramReel(
  settings: SettingsRow,
  videoUrl: string,
  caption: string,
  productId: string | undefined,
): Promise<PlatformResult> {
  if (!settings.instagram_business_account_id || !settings.facebook_access_token) {
    return { status: "skipped" };
  }
  try {
    const { mediaId } = await publishInstagramReel({
      igUserId: settings.instagram_business_account_id,
      accessToken: settings.facebook_access_token,
      videoUrl,
      caption,
      productId,
    });
    return { status: "success", id: mediaId };
  } catch (error) {
    console.error("[reelPostingService.runInstagramReel] failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Instagram Reel post failed.",
    };
  }
}

async function findCatalogProductIdForSku(
  settings: SettingsRow,
  sku: string | null,
): Promise<string | undefined> {
  if (
    !settings.product_tagging_enabled ||
    !settings.facebook_catalog_id ||
    !settings.facebook_access_token ||
    !sku
  ) {
    return undefined;
  }
  return (
    (await findCatalogProductId(
      settings.facebook_catalog_id,
      sku,
      settings.facebook_access_token,
    )) ?? undefined
  );
}

/**
 * Publishes an admin-uploaded video (made elsewhere, e.g. CapCut, with real
 * trending audio -- this app never generates the video itself) as a
 * Facebook Page Reel and an Instagram Reel, tagged to the given product via
 * the same Meta catalog the photo auto-poster uses. Unlike
 * publishProductToSocialMedia, publishing IS the action the admin explicitly
 * requested here, so setup failures (no settings, nothing enabled, product
 * not found) surface as a real error rather than being swallowed -- but a
 * per-platform publish failure still just gets recorded on the row, visible
 * in the history table, the same way the photo flow handles it.
 */
export async function createProductReel(
  input: ProductReelInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: settings } = await supabase
    .from("social_media_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!settings || (!settings.facebook_enabled && !settings.instagram_enabled)) {
    return {
      error:
        "Enable Facebook and/or Instagram in Social Auto-Post settings before publishing a reel.",
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, sku")
    .eq("id", input.productId)
    .maybeSingle();

  if (!product) {
    return { error: "Product not found." };
  }

  const catalogProductId = await findCatalogProductIdForSku(settings, product.sku);

  const [facebookResult, instagramResult] = await Promise.all([
    settings.facebook_enabled
      ? runFacebookReel(settings, input.videoUrl, input.caption, catalogProductId)
      : Promise.resolve<PlatformResult>({ status: "skipped" }),
    settings.instagram_enabled
      ? runInstagramReel(settings, input.videoUrl, input.caption, catalogProductId)
      : Promise.resolve<PlatformResult>({ status: "skipped" }),
  ]);

  const anySuccess =
    facebookResult.status === "success" || instagramResult.status === "success";

  const { data: inserted, error: insertError } = await supabase
    .from("product_reels")
    .insert({
      product_id: input.productId,
      video_url: input.videoUrl,
      caption: input.caption,
      facebook_status: facebookResult.status,
      facebook_video_id: facebookResult.id ?? null,
      facebook_error: facebookResult.error ?? null,
      instagram_status: instagramResult.status,
      instagram_media_id: instagramResult.id ?? null,
      instagram_error: instagramResult.error ?? null,
      posted_at: anySuccess ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error(
      "[reelPostingService.createProductReel] failed to save result:",
      insertError,
    );
    return { error: "Unable to save the reel posting result right now." };
  }

  return { id: inserted.id };
}

export async function retryProductReel(reelId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: reel } = await supabase
    .from("product_reels")
    .select("id, product_id, video_url, caption, retry_count, posted_at")
    .eq("id", reelId)
    .maybeSingle();
  if (!reel) return { error: "Reel not found." };

  const { data: settings } = await supabase
    .from("social_media_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (!settings || (!settings.facebook_enabled && !settings.instagram_enabled)) {
    return {
      error:
        "Enable Facebook and/or Instagram in Social Auto-Post settings before retrying.",
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, sku")
    .eq("id", reel.product_id)
    .maybeSingle();

  const catalogProductId = product
    ? await findCatalogProductIdForSku(settings, product.sku)
    : undefined;

  const [facebookResult, instagramResult] = await Promise.all([
    settings.facebook_enabled
      ? runFacebookReel(settings, reel.video_url, reel.caption, catalogProductId)
      : Promise.resolve<PlatformResult>({ status: "skipped" }),
    settings.instagram_enabled
      ? runInstagramReel(settings, reel.video_url, reel.caption, catalogProductId)
      : Promise.resolve<PlatformResult>({ status: "skipped" }),
  ]);

  const anySuccess =
    facebookResult.status === "success" || instagramResult.status === "success";

  const { error: updateError } = await supabase
    .from("product_reels")
    .update({
      facebook_status: facebookResult.status,
      facebook_video_id: facebookResult.id ?? null,
      facebook_error: facebookResult.error ?? null,
      instagram_status: instagramResult.status,
      instagram_media_id: instagramResult.id ?? null,
      instagram_error: instagramResult.error ?? null,
      posted_at: anySuccess ? new Date().toISOString() : reel.posted_at,
      retry_count: reel.retry_count + 1,
    })
    .eq("id", reelId);

  if (updateError) {
    console.error("[reelPostingService.retryProductReel] failed:", updateError);
    return { error: "Unable to save the retry result right now." };
  }
  return {};
}

interface ProductReelRow {
  id: string;
  product_id: string;
  video_url: string;
  caption: string;
  facebook_video_id: string | null;
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

function mapProductReelRow(row: ProductReelRow): ProductReelRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? null,
    productSlug: row.products?.slug ?? null,
    videoUrl: row.video_url,
    caption: row.caption,
    facebookVideoId: row.facebook_video_id,
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

export async function listProductReels(
  page: number,
  pageSize: number,
): Promise<PaginationResult<ProductReelRecord>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("product_reels")
    .select("*, products(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[reelPostingService.listProductReels] failed:", error);
    throw new Error("Unable to load reel posting history right now.");
  }

  const items = (data ?? []).map((row) =>
    mapProductReelRow(row as unknown as ProductReelRow),
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
