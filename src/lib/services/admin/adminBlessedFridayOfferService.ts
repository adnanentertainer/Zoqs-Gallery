import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  DEFAULT_BLESSED_FRIDAY_OFFER,
  type BlessedFridayOffer,
} from "@/types/blessedFridayOffer";

export async function getAdminBlessedFridayOffer(): Promise<BlessedFridayOffer> {
  await requireAdmin();

  const offer = await getSiteSetting<BlessedFridayOffer>(
    "blessed_friday_offer",
  );
  return offer ?? DEFAULT_BLESSED_FRIDAY_OFFER;
}

export async function updateAdminBlessedFridayOffer(
  input: BlessedFridayOffer,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (
    !Number.isFinite(input.discountPercentage) ||
    input.discountPercentage <= 0 ||
    input.discountPercentage > 100
  ) {
    return { error: "Discount percentage must be between 1 and 100." };
  }
  if (!Number.isFinite(input.minSpend) || input.minSpend < 0) {
    return { error: "Minimum spend must be zero or more." };
  }

  const supabase = await getSupabaseServerClient();
  const value: BlessedFridayOffer = {
    enabled: input.enabled,
    discountPercentage: input.discountPercentage,
    minSpend: input.minSpend,
  };

  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", "blessed_friday_offer");

  if (error) {
    console.error(
      "[adminBlessedFridayOfferService.updateAdminBlessedFridayOffer] failed:",
      error,
    );
    return { error: "Unable to save the Blessed Friday offer right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}
