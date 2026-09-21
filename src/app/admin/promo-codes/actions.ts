"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createPromoCode,
  deletePromoCode,
  setPromoCodeActive,
  updatePromoCode,
} from "@/lib/services/admin/adminPromoCodeService";
import type { AdminPromoCodeInput } from "@/types/promoCode";

function validatePromoCodeInput(
  input: AdminPromoCodeInput,
): string | undefined {
  if (input.code.trim().length === 0) return "Promo code is required.";
  if (!/^[A-Za-z0-9_-]+$/.test(input.code.trim())) {
    return "Promo code can only contain letters, numbers, hyphens, and underscores.";
  }
  if (!Number.isInteger(input.discountValue) || input.discountValue <= 0) {
    return "Discount value must be a positive whole number.";
  }
  if (input.discountType === "percentage" && input.discountValue > 100) {
    return "A percentage discount can't exceed 100%.";
  }
  if (input.minOrderAmount !== null && input.minOrderAmount < 0) {
    return "Minimum order amount can't be negative.";
  }
  if (input.maxDiscountAmount !== null && input.maxDiscountAmount < 0) {
    return "Maximum discount amount can't be negative.";
  }
  if (input.usageLimit !== null && input.usageLimit <= 0) {
    return "Usage limit must be a positive whole number.";
  }
  if (input.usageLimitPerCustomer !== null && input.usageLimitPerCustomer <= 0) {
    return "Usage limit per customer must be a positive whole number.";
  }
  if (
    input.startsAt &&
    input.expiresAt &&
    new Date(input.startsAt).getTime() > new Date(input.expiresAt).getTime()
  ) {
    return "Start date must be before the expiry date.";
  }
  return undefined;
}

export async function createPromoCodeAction(
  input: AdminPromoCodeInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validatePromoCodeInput(input);
  if (validationError) return { error: validationError };
  const result = await createPromoCode(input);
  if (!result.error) revalidatePath("/admin/promo-codes");
  return result;
}

export async function updatePromoCodeAction(
  id: string,
  input: AdminPromoCodeInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validatePromoCodeInput(input);
  if (validationError) return { error: validationError };
  const result = await updatePromoCode(id, input);
  if (!result.error) {
    revalidatePath("/admin/promo-codes");
    revalidatePath(`/admin/promo-codes/${id}`);
  }
  return result;
}

export async function setPromoCodeActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await setPromoCodeActive(id, isActive);
  if (!result.error) revalidatePath("/admin/promo-codes");
  return result;
}

export async function deletePromoCodeAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await deletePromoCode(id);
  if (!result.error) revalidatePath("/admin/promo-codes");
  return result;
}
