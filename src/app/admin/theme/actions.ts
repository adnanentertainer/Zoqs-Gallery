"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  updateAdminColorTheme,
  updateAdminColorThemeSchedule,
} from "@/lib/services/admin/adminColorThemeService";
import type { ColorThemeSchedule } from "@/types/colorTheme";

export async function updateAdminColorThemeAction(
  themeId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminColorTheme(themeId);
  if (!result.error) {
    // The theme applies via the root layout, so every route needs
    // revalidating -- same reasoning as the festival banner's "/", "layout".
    revalidatePath("/", "layout");
    revalidatePath("/admin/theme");
  }
  return result;
}

export async function updateAdminColorThemeScheduleAction(
  schedule: ColorThemeSchedule,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminColorThemeSchedule(schedule);
  if (!result.error) {
    revalidatePath("/", "layout");
    revalidatePath("/admin/theme");
  }
  return result;
}
