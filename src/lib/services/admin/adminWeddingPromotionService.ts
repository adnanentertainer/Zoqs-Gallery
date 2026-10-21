import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  DEFAULT_WEDDING_PROMOTION_SETTINGS,
  type WeddingPromotionSettings,
} from "@/types/weddingPromotion";

// Reuses the bucket created for per-promo-code hero banners (same kind of
// asset, same RLS shape) — see 20261013020000_promo_code_hero_images.sql and
// adminHeroImageService's identical use of it for default_hero_image.
const WEDDING_BANNER_IMAGE_BUCKET = "promo-hero-images";
const MAX_WEDDING_BANNER_IMAGE_BYTES = 5 * 1024 * 1024;

export async function getAdminWeddingPromotionSettings(): Promise<WeddingPromotionSettings> {
  await requireAdmin();

  const settings =
    await getSiteSetting<Partial<WeddingPromotionSettings>>("wedding_promotion");
  // Spread over the defaults (not a bare `?? default`) so a row saved before
  // `imageUrl` existed still resolves to "" instead of undefined.
  return { ...DEFAULT_WEDDING_PROMOTION_SETTINGS, ...settings };
}

export async function updateAdminWeddingPromotionSettings(
  input: WeddingPromotionSettings,
): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await getSupabaseServerClient();
  const value: WeddingPromotionSettings = {
    enabled: input.enabled,
    imageUrl: input.imageUrl,
  };

  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", "wedding_promotion");

  if (error) {
    console.error(
      "[adminWeddingPromotionService.updateAdminWeddingPromotionSettings] failed:",
      error,
    );
    return { error: "Unable to save the wedding promotion setting right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}

export async function uploadWeddingBannerImage(
  file: File,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_WEDDING_BANNER_IMAGE_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }

  const supabase = await getSupabaseServerClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `wedding/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(WEDDING_BANNER_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error(
      "[adminWeddingPromotionService.uploadWeddingBannerImage] failed:",
      uploadError,
    );
    return { error: "Unable to upload this image right now." };
  }

  const { data } = supabase.storage
    .from(WEDDING_BANNER_IMAGE_BUCKET)
    .getPublicUrl(path);
  return { url: data.publicUrl };
}
