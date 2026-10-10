import { unstable_cache } from "next/cache";
import { getProductReviews as getMockProductReviews } from "@/lib/reviews";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getSupabasePublicClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { mapReviewRow } from "@/lib/supabase/mappers";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { reviews as mockReviews } from "@/data/reviews";
import type { Review, Testimonial } from "@/types";

type ReviewRow = Parameters<typeof mapReviewRow>[0];

const getApprovedReviewRows = unstable_cache(
  async (productId: string): Promise<ReviewRow[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("review_date", { ascending: false });

    if (error) throw error;
    return (data ?? []) as ReviewRow[];
  },
  ["reviews:approved-by-product"],
  { tags: [CACHE_TAGS.reviews], revalidate: 3600 },
);

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
    const rows = await getApprovedReviewRows(productId);
    return rows.map((row) => mapReviewRow(row, productName));
  } catch (error) {
    console.error(
      "[reviewService.getProductReviews] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load reviews right now.");
  }
}

interface FeaturedReviewRow {
  id: string;
  customer_name: string;
  rating: number;
  review: string;
  is_verified_purchase: boolean;
  products: { name: string; slug: string } | null;
}

const getFeaturedReviewRows = unstable_cache(
  async (): Promise<FeaturedReviewRow[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, review, is_verified_purchase, products(name, slug)")
      .eq("is_approved", true)
      // "Customer" is the fallback name submitReview() writes when a
      // reviewer's profile has no name set — excluding it, along with rows
      // where the "review" is just the product's own name typed back (a
      // handful of early rows with no real text), keeps this homepage
      // spotlight to reviews that read like an actual customer wrote them.
      .neq("customer_name", "Customer")
      .order("rating", { ascending: false })
      .order("review_date", { ascending: false })
      .limit(12);

    if (error) throw error;
    return (data ?? []) as unknown as FeaturedReviewRow[];
  },
  ["reviews:featured"],
  { tags: [CACHE_TAGS.reviews], revalidate: 3600 },
);

/**
 * Real, named reviews for the homepage highlight reel — never the full
 * per-product review list (see getProductReviews for that), and never
 * placeholder content: an empty result means ReviewsSection renders nothing
 * rather than inventing testimonials.
 */
export async function getFeaturedTestimonials(
  limit: number,
): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    return mockReviews
      .filter((review) => review.customerName !== "Customer")
      .slice(0, limit)
      .map((review) => ({
        id: review.id,
        customerName: review.customerName,
        rating: review.rating,
        reviewText: review.reviewText,
        verifiedPurchase: review.verifiedPurchase,
        purchasedProduct: review.purchasedProduct,
        productSlug: "",
      }));
  }

  try {
    const rows = await getFeaturedReviewRows();
    return rows
      .filter((row) => row.products && row.customer_name !== row.review)
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        rating: row.rating,
        reviewText: row.review,
        verifiedPurchase: row.is_verified_purchase,
        purchasedProduct: row.products!.name,
        productSlug: row.products!.slug,
      }));
  } catch (error) {
    console.error(
      "[reviewService.getFeaturedTestimonials] Supabase query failed:",
      error,
    );
    return [];
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
