import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";

// Reuses the bucket created for per-promo-code hero banners (same kind of
// asset, same RLS shape) — see 20261013020000_promo_code_hero_images.sql.
const HERO_IMAGE_BUCKET = "promo-hero-images";
const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * The site-wide default hero image (site_settings key "default_hero_image").
 * Always a string — empty means "no override, keep the built-in default
 * photo" rather than null, since site_settings.value is a NOT NULL jsonb
 * column and sending a bare JS null through the client would try to write
 * SQL NULL into it, not a JSON null.
 */
export async function getAdminDefaultHeroImage(): Promise<string> {
  await requireAdmin();
  return (await getSiteSetting<string>("default_hero_image")) ?? "";
}

export async function updateAdminDefaultHeroImage(
  url: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ value: url })
    .eq("key", "default_hero_image");

  if (error) {
    console.error(
      "[adminHeroImageService.updateAdminDefaultHeroImage] failed:",
      error,
    );
    return { error: "Unable to save the hero image right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}

export async function uploadDefaultHeroImage(
  file: File,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_HERO_IMAGE_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }

  const supabase = await getSupabaseServerClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `default/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(HERO_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error(
      "[adminHeroImageService.uploadDefaultHeroImage] failed:",
      uploadError,
    );
    return { error: "Unable to upload this image right now." };
  }

  const { data } = supabase.storage.from(HERO_IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
