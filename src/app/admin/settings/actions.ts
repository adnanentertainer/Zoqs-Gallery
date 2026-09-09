"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  updateAdminStoreSettings,
  type AdminStoreSettings,
} from "@/lib/services/admin/adminSettingsService";

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
