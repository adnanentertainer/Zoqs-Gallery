"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from "@/lib/services/admin/supplierService";
import type { AdminSupplierInput } from "@/types/admin";

function validateSupplierInput(input: AdminSupplierInput): string | undefined {
  if (input.name.trim().length === 0) return "Supplier name is required.";
  return undefined;
}

export async function createSupplierAction(
  input: AdminSupplierInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const validationError = validateSupplierInput(input);
  if (validationError) return { error: validationError };
  return createSupplier(input);
}

export async function updateSupplierAction(
  id: string,
  input: AdminSupplierInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const validationError = validateSupplierInput(input);
  if (validationError) return { error: validationError };
  return updateSupplier(id, input);
}

export async function deleteSupplierAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  return deleteSupplier(id);
}
