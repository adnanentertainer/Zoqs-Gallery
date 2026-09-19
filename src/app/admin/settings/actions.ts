"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  updateAdminStoreSettings,
  type AdminStoreSettings,
} from "@/lib/services/admin/adminSettingsService";
import { updateAdminFestivalBanner } from "@/lib/services/admin/adminFestivalBannerService";
import type { FestivalBanner } from "@/types/festivalBanner";

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
