"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { recordStockMovement } from "@/lib/services/admin/inventoryService";
import type { StockAdjustmentInput } from "@/types/admin";

function validateInput(input: StockAdjustmentInput): string | undefined {
  if (!input.productId) return "Select a product.";
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return "Quantity must be a positive whole number.";
  }
  return undefined;
}

export async function recordStockMovementAction(
  input: StockAdjustmentInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const result = await recordStockMovement(input);
  if (!result.error) {
    // The product's own stock number is shown on /admin/products and
    // /admin/inventory too — revalidate both so they don't show stale
    // stock immediately after a movement is recorded here.
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/movements");
    revalidatePath("/admin/products");
  }
  return result;
}
