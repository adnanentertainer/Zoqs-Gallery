"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createProductReel,
  retryProductReel,
} from "@/lib/services/admin/reelPostingService";
import type { ProductReelInput } from "@/types/socialMedia";

function validateReelInput(input: ProductReelInput): string | undefined {
  if (!input.productId) return "Select a product.";
  if (input.videoUrl.trim().length === 0) return "Video URL is required.";
  if (input.caption.trim().length === 0) return "Caption is required.";
  return undefined;
}

export async function createReelAction(
  input: ProductReelInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateReelInput(input);
  if (validationError) return { error: validationError };

  const result = await createProductReel(input);
  if (!result.error) {
    revalidatePath("/admin/reels");
  }
  return result;
}

export async function retryReelAction(reelId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await retryProductReel(reelId);
  revalidatePath("/admin/reels");
  return result;
}
