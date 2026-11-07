import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { AdminHeroImageInput, AdminHeroImageListItem } from "@/types/heroImage";

// Reuses the bucket created for per-promo-code hero banners (same kind of
// asset, same RLS shape) — see 20261013020000_promo_code_hero_images.sql.
const HERO_IMAGE_BUCKET = "promo-hero-images";
const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024;

// getActiveHeroImages() reads straight from Supabase on every homepage
// request (see heroImageService.ts for why it skips unstable_cache), so the
// only cache this needs to bust is the page's own Full Route Cache entry.
function revalidateHeroImages() {
  revalidatePath("/");
}

export async function listAdminHeroImages(): Promise<
  AdminHeroImageListItem[]
> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hero_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[adminHeroCarouselService.listAdminHeroImages] failed:", error);
    throw new Error("Unable to load hero images right now.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url ?? "",
    altText: row.alt_text ?? "",
    isActive: row.is_active,
    displayOrder: row.display_order,
  }));
}

export async function getAdminHeroImageById(
  id: string,
): Promise<(AdminHeroImageInput & { id: string }) | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hero_images")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "[adminHeroCarouselService.getAdminHeroImageById] failed:",
      error,
    );
    throw new Error("Unable to load this hero image right now.");
  }
  if (!data) return null;

  return {
    id: data.id,
    imageUrl: data.image_url,
    mobileImageUrl: data.mobile_image_url ?? "",
    altText: data.alt_text ?? "",
    isActive: data.is_active,
    displayOrder: data.display_order,
  };
}

export async function createHeroImage(
  input: AdminHeroImageInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("hero_images")
    .insert({
      image_url: input.imageUrl,
      mobile_image_url: input.mobileImageUrl.trim() || null,
      alt_text: input.altText.trim() || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[adminHeroCarouselService.createHeroImage] failed:", error);
    return { error: "Unable to add this image right now." };
  }
  revalidateHeroImages();
  return { id: data.id };
}

export async function updateHeroImage(
  id: string,
  input: AdminHeroImageInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("hero_images")
    .update({
      image_url: input.imageUrl,
      mobile_image_url: input.mobileImageUrl.trim() || null,
      alt_text: input.altText.trim() || null,
      is_active: input.isActive,
      display_order: input.displayOrder,
    })
    .eq("id", id);

  if (error) {
    console.error("[adminHeroCarouselService.updateHeroImage] failed:", error);
    return { error: "Unable to update this image right now." };
  }
  revalidateHeroImages();
  return {};
}

export async function deleteHeroImage(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("hero_images").delete().eq("id", id);
  if (error) {
    console.error("[adminHeroCarouselService.deleteHeroImage] failed:", error);
    return { error: "Unable to delete this image right now." };
  }
  revalidateHeroImages();
  return {};
}

export async function uploadHeroCarouselImage(
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
  const path = `carousel/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(HERO_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error(
      "[adminHeroCarouselService.uploadHeroCarouselImage] failed:",
      uploadError,
    );
    return { error: "Unable to upload this image right now." };
  }

  const { data } = supabase.storage.from(HERO_IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
