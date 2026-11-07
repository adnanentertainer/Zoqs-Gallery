import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import type { HeroImage } from "@/types/heroImage";

/**
 * Active homepage hero carousel slides, in display order. Empty when none
 * are configured — callers fall back to the single default hero image.
 *
 * Deliberately NOT wrapped in unstable_cache like this file's siblings: on
 * this app's Next 16 + Turbopack dev server, a brand-new cache key reliably
 * raced to an empty result on its first population (verified by comparing
 * cached vs. uncached reads side by side against the same live data) —
 * unstable_cache is itself deprecated in favor of "use cache" as of Next 16,
 * so this isn't a regression worth chasing down. This is one small indexed
 * query alongside the dozen+ others already run per homepage request, so
 * skipping the cache here costs nothing worth trading for that risk.
 */
export async function getActiveHeroImages(): Promise<HeroImage[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("hero_images")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      altText: row.alt_text ?? "",
    }));
  } catch (error) {
    console.error(
      "[heroImageService.getActiveHeroImages] Supabase query failed:",
      error,
    );
    return [];
  }
}
