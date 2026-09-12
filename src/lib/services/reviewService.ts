import { getProductReviews as getMockProductReviews } from "@/lib/reviews";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/getServerUser";
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

export interface SubmitReviewResult {
  error?: string;
}

/**
 * Inserted with is_approved = false -- a submitted review never appears
 * publicly until an admin approves it (see the admin reviews screen).
 */
export async function submitReview(
  productId: string,
  rating: number,
  reviewText: string,
): Promise<SubmitReviewResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Reviews aren't available in this environment." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a rating from 1 to 5 stars." };
  }
  if (!reviewText.trim()) {
    return { error: "Please write a few words about the product." };
  }

  const user = await getServerUser();
  if (!user) {
    return { error: "Please log in to write a review." };
  }

  const supabase = await getSupabaseServerClient();

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingError) {
    console.error(
      "[reviewService.submitReview] duplicate check failed:",
      existingError,
    );
    return { error: "Unable to submit your review right now." };
  }
  if (existing) {
    return { error: "You've already reviewed this product." };
  }

  // "Verified Purchase" -- any of the customer's own non-cancelled orders
  // that includes this product, checked in two simple queries (rather than
  // an embedded-filter join) to match this codebase's existing PostgREST
  // usage elsewhere.
  const { data: userOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .neq("status", "cancelled");
  if (ordersError) {
    console.error(
      "[reviewService.submitReview] order lookup failed:",
      ordersError,
    );
    return { error: "Unable to submit your review right now." };
  }

  let isVerifiedPurchase = false;
  const orderIds = (userOrders ?? []).map((order) => order.id);
  if (orderIds.length > 0) {
    const { count, error: itemsError } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .in("order_id", orderIds);
    if (itemsError) {
      console.error(
        "[reviewService.submitReview] order item lookup failed:",
        itemsError,
      );
      return { error: "Unable to submit your review right now." };
    }
    isVerifiedPurchase = (count ?? 0) > 0;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name")
    .eq("id", user.id)
    .maybeSingle();
  const customerName =
    profile?.full_name?.trim() || profile?.first_name?.trim() || "Customer";

  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    customer_name: customerName,
    rating,
    review: reviewText.trim(),
    is_verified_purchase: isVerifiedPurchase,
    is_approved: false,
  });
  if (insertError) {
    console.error("[reviewService.submitReview] insert failed:", insertError);
    return { error: "Unable to submit your review right now." };
  }

  return {};
}
