import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  DEFAULT_WEDDING_PROMOTION_SETTINGS,
  type WeddingPromotionSettings,
} from "@/types/weddingPromotion";

export async function getAdminWeddingPromotionSettings(): Promise<WeddingPromotionSettings> {
  await requireAdmin();

  const settings =
    await getSiteSetting<WeddingPromotionSettings>("wedding_promotion");
  return settings ?? DEFAULT_WEDDING_PROMOTION_SETTINGS;
}

export async function updateAdminWeddingPromotionSettings(
  input: WeddingPromotionSettings,
): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await getSupabaseServerClient();
  const value: WeddingPromotionSettings = { enabled: input.enabled };

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
