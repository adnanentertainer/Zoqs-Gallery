import { RatingStars } from "@/components/shared/RatingStars";
import type { ReviewBreakdown } from "@/types";

interface ReviewSummaryProps {
  rating: number;
  reviewsCount: number;
  breakdown: ReviewBreakdown[];
}

export function ReviewSummary({
  rating,
  reviewsCount,
  breakdown,
}: ReviewSummaryProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex flex-col items-center gap-1 sm:items-start">
        <span className="font-heading text-4xl font-semibold text-primary">
          {rating.toFixed(1)}
        </span>
        <RatingStars rating={rating} starClassName="h-4 w-4" />
        <span className="font-body text-sm text-muted">
          {reviewsCount} reviews
        </span>
      </div>

      <div
        className="flex flex-1 flex-col gap-2"
        role="list"
        aria-label="Rating breakdown"
      >
        {breakdown.map((row) => (
          <div
            key={row.stars}
            role="listitem"
            className="flex items-center gap-3"
          >
            <span className="w-12 shrink-0 font-body text-xs text-muted">
              {row.stars} stars
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-beige">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${row.percentage}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="w-10 shrink-0 text-right font-body text-xs text-muted">
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
