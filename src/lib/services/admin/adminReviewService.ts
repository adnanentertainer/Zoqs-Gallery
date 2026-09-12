import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { AdminReviewListItem } from "@/types/admin";

export async function listAdminReviews(): Promise<AdminReviewListItem[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[adminReviewService.listAdminReviews] failed:", error);
    throw new Error("Unable to load reviews right now.");
  }
  if (!reviews || reviews.length === 0) return [];

  // The reviews<->products relationship isn't declared in this hand-written
  // Database type's Relationships, so the typed client can't embed it in
  // one query -- a second lookup avoids that entirely, same as elsewhere in
  // this codebase when a join isn't straightforward.
  const productIds = [...new Set(reviews.map((row) => row.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  if (productsError) {
    console.error(
      "[adminReviewService.listAdminReviews] product lookup failed:",
      productsError,
    );
    throw new Error("Unable to load reviews right now.");
  }
  const productNameById = new Map(
    (products ?? []).map((product) => [product.id, product.name]),
  );

  return reviews.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: productNameById.get(row.product_id) ?? "Unknown product",
    customerName: row.customer_name,
    rating: row.rating,
    reviewText: row.review,
    reviewDate: row.review_date,
    isVerifiedPurchase: row.is_verified_purchase,
    isApproved: row.is_approved,
  }));
}

export async function approveReview(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) {
    console.error("[adminReviewService.approveReview] failed:", error);
    return { error: "Unable to approve this review right now." };
  }
  return {};
}

export async function unapproveReview(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: false })
    .eq("id", id);

  if (error) {
    console.error("[adminReviewService.unapproveReview] failed:", error);
    return { error: "Unable to hide this review right now." };
  }
  return {};
}

export async function deleteReview(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    console.error("[adminReviewService.deleteReview] failed:", error);
    return { error: "Unable to delete this review right now." };
  }
  return {};
}
