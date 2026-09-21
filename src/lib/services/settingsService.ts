import { unstable_cache } from "next/cache";
import { siteConfig } from "@/constants/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { DEFAULT_FESTIVAL_BANNER } from "@/types/festivalBanner";

// Mirrors the site_settings rows seeded by scripts/seed.ts. Used as the mock
// fallback so getSiteSetting() behaves identically whether or not Supabase is
// configured. NOTE: siteConfig (constants/site.ts) remains the actual source
// of truth consumed directly by Header/Footer/AnnouncementBar/lib/cart.ts —
// see the Phase 7 report for why those weren't rewired through this service.
const MOCK_SETTINGS: Record<string, unknown> = {
  free_shipping_threshold: siteConfig.freeShippingThreshold,
  flat_shipping_cost: siteConfig.flatShippingCost,
  site_name: siteConfig.name,
  site_tagline: siteConfig.tagline,
  announcement_text: siteConfig.announcement,
  currency: siteConfig.currency,
  country: siteConfig.country,
  social_links: siteConfig.socialLinks,
  festival_banner: DEFAULT_FESTIVAL_BANNER,
};

// This is a public, admin-managed setting read on nearly every page (festival
// banner, announcement bar, shipping thresholds), so it's cached and tagged
// for revalidateTag(CACHE_TAGS.siteSettings), called from
// adminSettingsService/adminFestivalBannerService whenever an admin saves.
const getSiteSettingUncached = unstable_cache(
  async (key: string): Promise<unknown> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) throw error;
    const row = data as { value: unknown } | null;
    return row?.value ?? null;
  },
  ["site-settings:by-key"],
  { tags: [CACHE_TAGS.siteSettings], revalidate: 300 },
);

export async function getSiteSetting<T = unknown>(
  key: string,
): Promise<T | undefined> {
  if (!isSupabaseConfigured()) {
    return MOCK_SETTINGS[key] as T | undefined;
  }

  try {
    const value = await getSiteSettingUncached(key);
    return (value as T | null) ?? undefined;
  } catch (error) {
    console.error(
      `[settingsService.getSiteSetting] Supabase query failed for key "${key}":`,
      error,
    );
    throw new Error("Unable to load site settings right now.");
  }
}
