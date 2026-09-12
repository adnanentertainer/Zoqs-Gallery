"use server";

import { revalidatePath } from "next/cache";
import {
  approveReview,
  deleteReview,
  unapproveReview,
} from "@/lib/services/admin/adminReviewService";

export async function approveReviewAction(
  id: string,
): Promise<{ error?: string }> {
  const result = await approveReview(id);
  if (!result.error) revalidatePath("/admin/reviews");
  return result;
}

export async function unapproveReviewAction(
  id: string,
): Promise<{ error?: string }> {
  const result = await unapproveReview(id);
  if (!result.error) revalidatePath("/admin/reviews");
  return result;
}

export async function deleteReviewAction(
  id: string,
): Promise<{ error?: string }> {
  const result = await deleteReview(id);
  if (!result.error) revalidatePath("/admin/reviews");
  return result;
}
