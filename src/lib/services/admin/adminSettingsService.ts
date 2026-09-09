import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { siteConfig } from "@/constants/site";

export interface AdminStoreSettings {
  siteName: string;
  currency: string;
  country: string;
  freeShippingThreshold: number;
  flatShippingCost: number;
}

/**
 * Manages exactly the keys the Phase 10 spec names — store name, currency,
 * country, and the two shipping settings already introduced in Phase 9.
 * Reuses the existing site_settings architecture from Phase 7 (no new
 * storage mechanism); other seeded keys (tagline, announcement, social
 * links) are out of scope for this phase's settings screen.
 */
export async function getAdminStoreSettings(): Promise<AdminStoreSettings> {
  await requireAdmin();

  const [siteName, currency, country, freeShippingThreshold, flatShippingCost] =
    await Promise.all([
      getSiteSetting<string>("site_name"),
      getSiteSetting<string>("currency"),
      getSiteSetting<string>("country"),
      getSiteSetting<number>("free_shipping_threshold"),
      getSiteSetting<number>("flat_shipping_cost"),
    ]);

  return {
    siteName: siteName ?? siteConfig.name,
    currency: currency ?? siteConfig.currency,
    country: country ?? siteConfig.country,
    freeShippingThreshold:
      freeShippingThreshold ?? siteConfig.freeShippingThreshold,
    flatShippingCost: flatShippingCost ?? siteConfig.flatShippingCost,
  };
}

export async function updateAdminStoreSettings(
  input: AdminStoreSettings,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (input.siteName.trim().length === 0) {
    return { error: "Store name is required." };
  }
  if (input.country.trim().length === 0) {
    return { error: "Country is required." };
  }
  if (input.currency.trim().length === 0) {
    return { error: "Currency is required." };
  }
  if (
    !Number.isFinite(input.freeShippingThreshold) ||
    input.freeShippingThreshold < 0
  ) {
    return { error: "Free shipping threshold must be zero or more." };
  }
  if (!Number.isFinite(input.flatShippingCost) || input.flatShippingCost < 0) {
    return { error: "Flat shipping cost must be zero or more." };
  }

  const supabase = await getSupabaseServerClient();
  const updates: { key: string; value: string | number }[] = [
    { key: "site_name", value: input.siteName.trim() },
    { key: "currency", value: input.currency.trim() },
    { key: "country", value: input.country.trim() },
    { key: "free_shipping_threshold", value: input.freeShippingThreshold },
    { key: "flat_shipping_cost", value: input.flatShippingCost },
  ];

  for (const { key, value } of updates) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    if (error) {
      console.error(
        `[adminSettingsService.updateAdminStoreSettings] failed for "${key}":`,
        error,
      );
      return { error: "Unable to save settings right now." };
    }
  }

  return {};
}
