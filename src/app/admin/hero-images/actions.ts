"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createHeroImage,
  deleteHeroImage,
  updateHeroImage,
  uploadHeroCarouselImage,
} from "@/lib/services/admin/adminHeroCarouselService";
import type { AdminHeroImageInput } from "@/types/heroImage";

function validateHeroImageInput(
  input: AdminHeroImageInput,
): string | undefined {
  if (input.imageUrl.trim().length === 0) return "Image URL is required.";
  if (!Number.isInteger(input.displayOrder)) {
    return "Display order must be a whole number.";
  }
  return undefined;
}

export async function createHeroImageAction(
  input: AdminHeroImageInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateHeroImageInput(input);
  if (validationError) return { error: validationError };
  return createHeroImage(input);
}

export async function updateHeroImageAction(
  id: string,
  input: AdminHeroImageInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateHeroImageInput(input);
  if (validationError) return { error: validationError };
  return updateHeroImage(id, input);
}

export async function deleteHeroImageAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deleteHeroImage(id);
}

export async function uploadHeroImageAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }
  return uploadHeroCarouselImage(file);
}
