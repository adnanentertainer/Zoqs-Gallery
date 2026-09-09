"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { isValidSlug } from "@/lib/admin/slug";
import {
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  type AdminCategoryInput,
} from "@/lib/services/admin/adminCategoryService";

function validateCategoryInput(input: AdminCategoryInput): string | undefined {
  if (input.name.trim().length === 0) return "Category name is required.";
  if (!isValidSlug(input.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens only.";
  }
  if (!Number.isInteger(input.displayOrder)) {
    return "Display order must be a whole number.";
  }
  return undefined;
}

export async function createCategoryAction(
  input: AdminCategoryInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateCategoryInput(input);
  if (validationError) return { error: validationError };
  return createCategoryService(input);
}

export async function updateCategoryAction(
  id: string,
  input: AdminCategoryInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateCategoryInput(input);
  if (validationError) return { error: validationError };
  return updateCategoryService(id, input);
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deleteCategoryService(id);
}
