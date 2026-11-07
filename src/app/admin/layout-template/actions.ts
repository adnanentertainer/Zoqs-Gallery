"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { updateAdminLayoutTemplate } from "@/lib/services/admin/adminLayoutTemplateService";
import type { LayoutTemplate } from "@/types/layoutTemplate";

export async function updateAdminLayoutTemplateAction(
  template: LayoutTemplate,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateAdminLayoutTemplate(template);
  if (!result.error) {
    // The layout applies on the homepage, which every route's nav/footer
    // link back to -- revalidating "/" with "layout" scope is the same
    // reasoning the color theme action already uses.
    revalidatePath("/", "layout");
    revalidatePath("/admin/layout-template");
  }
  return result;
}
