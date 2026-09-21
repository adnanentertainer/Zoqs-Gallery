import { revalidatePath, revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type {
  AdminPromoBannerInput,
  AdminPromoBannerListItem,
} from "@/types/promoBanner";
import type { Database } from "@/types/supabase";

type BannerRow = Database["public"]["Tables"]["promotional_banners"]["Row"];
type PromoCodeRef = { code: string } | null;

function toListItem(
  row: BannerRow,
  promoCode: PromoCodeRef,
): AdminPromoBannerListItem {
  return {
    id: row.id,
    title: row.title,
    promoCode: promoCode?.code ?? null,
    bannerImageUrl: row.banner_image_url ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active,
    displayOrder: row.display_order,
  };
}

function toInput(row: BannerRow): AdminPromoBannerInput {
  return {
    title: row.title,
    subtitle: row.subtitle ?? "",
    promoText: row.promo_text ?? "",
    promoCodeId: row.promo_code_id,
    buttonText: row.button_text ?? "",
    buttonLink: row.button_link ?? "",
    bannerImageUrl: row.banner_image_url ?? "",
    backgroundImageUrl: row.background_image_url ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active,
    displayOrder: row.display_order,
  };
}

export async function listAdminPromoBanners(): Promise<
  AdminPromoBannerListItem[]
> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("promotional_banners")
    .select("*, promo_codes(code)")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[adminPromoBannerService.listAdminPromoBanners] failed:", error);
    throw new Error("Unable to load banners right now.");
  }

  return (data ?? []).map((row) =>
    toListItem(row, (row as unknown as { promo_codes: PromoCodeRef }).promo_codes),
  );
}

export async function getAdminPromoBannerById(
  id: string,
): Promise<(AdminPromoBannerInput & { id: string }) | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("promotional_banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[adminPromoBannerService.getAdminPromoBannerById] failed:", error);
    throw new Error("Unable to load this banner right now.");
  }
  if (!data) return null;
  return { id: data.id, ...toInput(data) };
}

function toRowPayload(input: AdminPromoBannerInput) {
  return {
    title: input.title.trim(),
    subtitle: input.subtitle.trim() || null,
    promo_text: input.promoText.trim() || null,
    promo_code_id: input.promoCodeId,
    button_text: input.buttonText.trim() || null,
    button_link: input.buttonLink.trim() || null,
    banner_image_url: input.bannerImageUrl.trim() || null,
    background_image_url: input.backgroundImageUrl.trim() || null,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    is_active: input.isActive,
    display_order: input.displayOrder,
  };
}

function revalidateHomepage() {
  revalidateTag(CACHE_TAGS.promoBanners, { expire: 0 });
  revalidatePath("/");
}

export async function createPromoBanner(
  input: AdminPromoBannerInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("promotional_banners")
    .insert(toRowPayload(input))
    .select("id")
    .single();

  if (error) {
    console.error("[adminPromoBannerService.createPromoBanner] failed:", error);
    return { error: "Unable to create this banner right now." };
  }
  revalidateHomepage();
  return { id: data.id };
}

export async function updatePromoBanner(
  id: string,
  input: AdminPromoBannerInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("promotional_banners")
    .update(toRowPayload(input))
    .eq("id", id);

  if (error) {
    console.error("[adminPromoBannerService.updatePromoBanner] failed:", error);
    return { error: "Unable to update this banner right now." };
  }
  revalidateHomepage();
  return {};
}

export async function setPromoBannerActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("promotional_banners")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[adminPromoBannerService.setPromoBannerActive] failed:", error);
    return { error: "Unable to update this banner right now." };
  }
  revalidateHomepage();
  return {};
}

export async function deletePromoBanner(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("promotional_banners")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[adminPromoBannerService.deletePromoBanner] failed:", error);
    return { error: "Unable to delete this banner right now." };
  }
  revalidateHomepage();
  return {};
}
