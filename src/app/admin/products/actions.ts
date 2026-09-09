"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { isValidSlug } from "@/lib/admin/slug";
import {
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  setProductActive as setProductActiveService,
} from "@/lib/services/admin/adminProductService";
import type { AdminProductInput } from "@/types/admin";

function validateProductInput(input: AdminProductInput): string | undefined {
  if (input.name.trim().length === 0) return "Product name is required.";
  if (!isValidSlug(input.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens only.";
  }
  if (input.description.trim().length === 0) {
    return "Full description is required.";
  }
  if (!input.categoryId) return "Select a category.";
  if (!Number.isFinite(input.price) || input.price <= 0) {
    return "Price must be greater than zero.";
  }
  if (
    input.originalPrice !== null &&
    (!Number.isFinite(input.originalPrice) || input.originalPrice < input.price)
  ) {
    return "Compare-at price must be greater than or equal to the price.";
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return "Stock must be zero or more.";
  }
  for (const variant of input.variants) {
    if (variant.optionValue.trim().length === 0) {
      return "Every variant needs a value (e.g. Gold, Small).";
    }
    if (
      variant.stock !== null &&
      (!Number.isInteger(variant.stock) || variant.stock < 0)
    ) {
      return "Variant stock must be zero or more.";
    }
  }
  return undefined;
}

export async function createProductAction(
  input: AdminProductInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateProductInput(input);
  if (validationError) return { error: validationError };
  return createProductService(input);
}

export async function updateProductAction(
  id: string,
  input: AdminProductInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateProductInput(input);
  if (validationError) return { error: validationError };
  return updateProductService(id, input);
}

export async function deleteProductAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deleteProductService(id);
}

export async function setProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  return setProductActiveService(id, isActive);
}
