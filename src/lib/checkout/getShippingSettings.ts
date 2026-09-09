import { siteConfig } from "@/constants/site";
import { getSiteSetting } from "@/lib/services/settingsService";
import type { ShippingSettings } from "@/lib/checkout/shipping";

/**
 * Server-only: reads shipping configuration from site_settings (falling
 * back to constants/site.ts when Supabase isn't configured or a key is
 * missing) so the checkout page's displayed estimate and the server-side
 * order total are derived from the same source. The create_order() RPC
 * re-reads site_settings independently and is the authoritative
 * calculation — this is only ever used for client-facing display before
 * submission. Kept in its own module (separate from calculateShippingCost)
 * so client components can import the pure calculation without pulling in
 * the Supabase server client's next/headers dependency.
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  const [freeShippingThreshold, flatShippingCost] = await Promise.all([
    getSiteSetting<number>("free_shipping_threshold"),
    getSiteSetting<number>("flat_shipping_cost"),
  ]);

  return {
    freeShippingThreshold:
      freeShippingThreshold ?? siteConfig.freeShippingThreshold,
    flatShippingCost: flatShippingCost ?? siteConfig.flatShippingCost,
  };
}
