"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  updateAdminStoreSettings,
  type AdminStoreSettings,
} from "@/lib/services/admin/adminSettingsService";
import { updateAdminFestivalBanner } from "@/lib/services/admin/adminFestivalBannerService";
import {
  updateAdminDefaultHeroImage,
  uploadDefaultHeroImage,
} from "@/lib/services/admin/adminHeroImageService";
import { updateAdminBlessedFridayOffer } from "@/lib/services/admin/adminBlessedFridayOfferService";
import {
  updateAdminWeddingPromotionSettings,
  uploadWeddingBannerImage,
} from "@/lib/services/admin/adminWeddingPromotionService";
import type { FestivalBanner } from "@/types/festivalBanner";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";
import type { WeddingPromotionSettings } from "@/types/weddingPromotion";

export async function updateAdminStoreSettingsAction(
  input: AdminStoreSettings,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminStoreSettings(input);
  if (!result.error) {
    revalidatePath("/admin/settings");
    // Shipping settings affect the public checkout estimate immediately.
    revalidatePath("/checkout");
  }
  return result;
}

export async function updateAdminFestivalBannerAction(
  input: FestivalBanner,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminFestivalBanner(input);
  if (!result.error) {
    // The banner renders in the root layout, so every route needs revalidating.
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  }
  return result;
}

export async function updateAdminBlessedFridayOfferAction(
  input: BlessedFridayOffer,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminBlessedFridayOffer(input);
  if (!result.error) {
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/cart");
  }
  return result;
}

export async function updateAdminWeddingPromotionAction(
  input: WeddingPromotionSettings,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminWeddingPromotionSettings(input);
  if (!result.error) {
    revalidatePath("/admin/settings");
    revalidatePath("/");
  }
  return result;
}

export async function updateAdminDefaultHeroImageAction(
  url: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminDefaultHeroImage(url);
  if (!result.error) {
    revalidatePath("/admin/settings");
    revalidatePath("/");
  }
  return result;
}

export async function uploadDefaultHeroImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }
  return uploadDefaultHeroImage(file);
}

export async function uploadWeddingBannerImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }
  return uploadWeddingBannerImage(file);
}
