"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  deleteOrder,
  updateOrderStatus,
} from "@/lib/services/admin/adminOrderService";

export async function updateOrderStatusAction(
  id: string,
  input: { status?: string; paymentStatus?: string },
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await updateOrderStatus(id, input);
  if (!result.error) {
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
  }
  return result;
}

export async function deleteOrderAction(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await deleteOrder(id);
  if (!result.error) {
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
  }
  return result;
}
