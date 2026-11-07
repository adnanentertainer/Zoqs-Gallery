import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getSiteSetting } from "@/lib/services/settingsService";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { DEFAULT_SALE_OFFER, type SaleOffer } from "@/types/saleOffer";

export async function getAdminSaleOffer(): Promise<SaleOffer> {
  await requireAdmin();

  const offer = await getSiteSetting<SaleOffer>("sale_offer");
  return offer ?? DEFAULT_SALE_OFFER;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function updateAdminSaleOffer(
  input: SaleOffer,
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
    return { error: "Minimum order value must be zero or more." };
  }
  if (input.startDate && !isValidIsoDate(input.startDate)) {
    return { error: "Start date is invalid." };
  }
  if (input.endDate && !isValidIsoDate(input.endDate)) {
    return { error: "End date is invalid." };
  }
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    return { error: "End date must be on or after the start date." };
  }

  const supabase = await getSupabaseServerClient();
  const value: SaleOffer = {
    enabled: input.enabled,
    name: input.name.trim(),
    discountPercentage: input.discountPercentage,
    minSpend: input.minSpend,
    startDate: input.startDate || null,
    endDate: input.endDate || null,
  };

  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", "sale_offer");

  if (error) {
    console.error(
      "[adminSaleOfferService.updateAdminSaleOffer] failed:",
      error,
    );
    return { error: "Unable to save the Sale right now." };
  }

  revalidateTag(CACHE_TAGS.siteSettings, { expire: 0 });
  return {};
}
