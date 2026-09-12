"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  completePurchase,
  createPurchase,
  deletePurchase,
  updatePurchase,
} from "@/lib/services/admin/purchaseService";
import type { AdminPurchaseInput } from "@/types/admin";

function validatePurchaseInput(input: AdminPurchaseInput): string | undefined {
  if (!input.supplierId) return "Select a supplier.";
  if (input.items.length === 0) return "Add at least one item.";
  for (const item of input.items) {
    if (!item.productName.trim()) return "Every item needs a product.";
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "Quantity must be a positive whole number for every item.";
    }
    if (item.costPrice < 0) return "Cost price can't be negative.";
  }
  return undefined;
}

export async function createPurchaseAction(
  input: AdminPurchaseInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validatePurchaseInput(input);
  if (validationError) return { error: validationError };
  return createPurchase(input);
}

export async function updatePurchaseAction(
  id: string,
  input: AdminPurchaseInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validatePurchaseInput(input);
  if (validationError) return { error: validationError };
  return updatePurchase(id, input);
}

export async function deletePurchaseAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deletePurchase(id);
}

export async function completePurchaseAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await completePurchase(id);
  if (!result.error) {
    // Completing a purchase bumps product/variant stock and logs movements —
    // revalidate every page that shows either.
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/movements");
    revalidatePath("/admin/products");
    revalidatePath("/admin/purchases");
    revalidatePath(`/admin/purchases/${id}`);
  }
  return result;
}
