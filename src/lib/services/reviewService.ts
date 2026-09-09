import { getProductReviews as getMockProductReviews } from "@/lib/reviews";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapReviewRow } from "@/lib/supabase/mappers";
import type { Review } from "@/types";

/**
 * @param productId product.id as returned by productService (a Supabase UUID
 *   when configured, a mock "prod-XXX" id otherwise).
 * @param productName used to fill Review.purchasedProduct — the caller
 *   already has the product in hand (it just fetched it to get productId),
 *   so this avoids a redundant join/query here.
 */
export async function getProductReviews(
  productId: string,
  productName: string,
): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return getMockProductReviews(productId);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("review_date", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => mapReviewRow(row, productName));
  } catch (error) {
    console.error(
      "[reviewService.getProductReviews] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load reviews right now.");
  }
}
