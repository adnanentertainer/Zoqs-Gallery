"use server";

import { revalidatePath } from "next/cache";
import {
  submitReview,
  type SubmitReviewResult,
} from "@/lib/services/reviewService";

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  rating: number,
  reviewText: string,
): Promise<SubmitReviewResult> {
  const result = await submitReview(productId, rating, reviewText);
  if (!result.error) {
    revalidatePath(`/product/${productSlug}`);
  }
  return result;
}
