import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { PromoBanner } from "@/types/promoBanner";
import type { Database } from "@/types/supabase";

type BannerRow = Database["public"]["Tables"]["promotional_banners"]["Row"];

function isWithinWindow(row: BannerRow): boolean {
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return false;
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return false;
  return true;
}

function mapBannerRow(
  row: BannerRow,
  promoCode: { code: string } | null,
): PromoBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    promoText: row.promo_text ?? "",
    promoCode: promoCode?.code ?? null,
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

// Read on every homepage load, so this follows the same cached + tagged
// pattern as settingsService.getSiteSetting — an admin save calls
// revalidateTag(CACHE_TAGS.promoBanners) so the change shows up immediately
// instead of waiting out the 5-minute window below.
const getActivePromoBannersUncached = unstable_cache(
  async (): Promise<PromoBanner[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("promotional_banners")
      .select("*, promo_codes(code)")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? [])
      .filter((row) => isWithinWindow(row))
      .map((row) =>
        mapBannerRow(
          row,
          (row as unknown as { promo_codes: { code: string } | null })
            .promo_codes,
        ),
      );
  },
  ["promo-banners:active"],
  { tags: [CACHE_TAGS.promoBanners], revalidate: 300 },
);

export async function getActivePromoBanners(): Promise<PromoBanner[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    return await getActivePromoBannersUncached();
  } catch (error) {
    console.error(
      "[promoBannerService.getActivePromoBanners] Supabase query failed:",
      error,
    );
    return [];
  }
}
