import { BadgeCheck } from "lucide-react";
import { RatingStars } from "@/components/shared/RatingStars";
import type { Review } from "@/types";

interface ProductReviewsProps {
  reviews: Review[];
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ProductReviews({ reviews }: ProductReviewsProps) {
  if (reviews.length === 0) {
    return (
      <p className="font-body text-sm text-muted">
        No reviews yet for this piece — be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col gap-2 border-b border-beige pb-6 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-body text-sm font-semibold text-primary">
                {review.customerName}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 font-body text-xs text-success">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified Purchase
                </span>
              )}
            </div>
            <time
              dateTime={review.date}
              className="font-body text-xs text-muted"
            >
              {dateFormatter.format(new Date(review.date))}
            </time>
          </div>
          <RatingStars rating={review.rating} />
          <p className="font-body text-sm text-primary">{review.reviewText}</p>
        </li>
      ))}
    </ul>
  );
}
