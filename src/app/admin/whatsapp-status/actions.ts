"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  markWhatsAppStatusPosted,
  dismissWhatsAppStatusItem,
} from "@/lib/services/admin/whatsappStatusService";

export async function markWhatsAppStatusPostedAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await markWhatsAppStatusPosted(id);
  if (!result.error) {
    revalidatePath("/admin/whatsapp-status");
  }
  return result;
}

export async function dismissWhatsAppStatusItemAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await dismissWhatsAppStatusItem(id);
  if (!result.error) {
    revalidatePath("/admin/whatsapp-status");
  }
  return result;
}
