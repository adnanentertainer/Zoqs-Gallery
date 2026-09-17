"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createSocialPost as createSocialPostService,
  updateSocialPost as updateSocialPostService,
  deleteSocialPost as deleteSocialPostService,
} from "@/lib/services/admin/adminSocialPostService";
import type { AdminSocialPostInput } from "@/types/admin";

function validateSocialPostInput(
  input: AdminSocialPostInput,
): string | undefined {
  if (input.imageUrl.trim().length === 0) return "Image URL is required.";
  if (input.alt.trim().length === 0) return "Alt text is required.";
  if (!Number.isInteger(input.displayOrder)) {
    return "Display order must be a whole number.";
  }
  return undefined;
}

export async function createSocialPostAction(
  input: AdminSocialPostInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateSocialPostInput(input);
  if (validationError) return { error: validationError };
  return createSocialPostService(input);
}

export async function updateSocialPostAction(
  id: string,
  input: AdminSocialPostInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateSocialPostInput(input);
  if (validationError) return { error: validationError };
  return updateSocialPostService(id, input);
}

export async function deleteSocialPostAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deleteSocialPostService(id);
}
