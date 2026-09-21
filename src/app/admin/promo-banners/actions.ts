"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createPromoBanner,
  deletePromoBanner,
  setPromoBannerActive,
  updatePromoBanner,
} from "@/lib/services/admin/adminPromoBannerService";
import type { AdminPromoBannerInput } from "@/types/promoBanner";

function validatePromoBannerInput(
  input: AdminPromoBannerInput,
): string | undefined {
  if (input.title.trim().length === 0) return "Banner title is required.";
  if (!Number.isInteger(input.displayOrder)) {
    return "Display order must be a whole number.";
  }
  if (
    input.startsAt &&
    input.endsAt &&
    new Date(input.startsAt).getTime() > new Date(input.endsAt).getTime()
  ) {
    return "Start date must be before the end date.";
  }
  return undefined;
}

export async function createPromoBannerAction(
  input: AdminPromoBannerInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validatePromoBannerInput(input);
  if (validationError) return { error: validationError };
  return createPromoBanner(input);
}

export async function updatePromoBannerAction(
  id: string,
  input: AdminPromoBannerInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validatePromoBannerInput(input);
  if (validationError) return { error: validationError };
  return updatePromoBanner(id, input);
}

export async function setPromoBannerActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  return setPromoBannerActive(id, isActive);
}

export async function deletePromoBannerAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deletePromoBanner(id);
}
