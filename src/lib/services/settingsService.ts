import { siteConfig } from "@/constants/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
};

export async function getSiteSetting<T = unknown>(
  key: string,
): Promise<T | undefined> {
  if (!isSupabaseConfigured()) {
    return MOCK_SETTINGS[key] as T | undefined;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) throw error;
    const row = data as { value: unknown } | null;
    return (row?.value as T | undefined) ?? undefined;
  } catch (error) {
    console.error(
      `[settingsService.getSiteSetting] Supabase query failed for key "${key}":`,
      error,
    );
    throw new Error("Unable to load site settings right now.");
  }
}
