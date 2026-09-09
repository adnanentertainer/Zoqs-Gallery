import { reviews } from "@/data/reviews";
import type { Review, ReviewBreakdown } from "@/types";

export function getProductReviews(productId: string): Review[] {
  return reviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAverageRating(productReviews: Review[]): number {
  if (productReviews.length === 0) return 0;
  const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / productReviews.length) * 10) / 10;
}

export function getReviewBreakdown(
  productReviews: Review[],
): ReviewBreakdown[] {
  const total = productReviews.length;

  return ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = productReviews.filter(
      (review) => Math.round(review.rating) === stars,
    ).length;
    return {
      stars,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}
