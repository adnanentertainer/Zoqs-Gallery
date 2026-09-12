import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Typography";
import { RatingStars } from "@/components/shared/RatingStars";
import { ReviewModerationActions } from "@/components/admin/ReviewModerationActions";
import { listAdminReviews } from "@/lib/services/admin/adminReviewService";

export const metadata: Metadata = {
  title: "Reviews | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminReviewsPage() {
  const reviews = await listAdminReviews();
  const pendingCount = reviews.filter((review) => !review.isApproved).length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reviews"
        description={`${reviews.length} review${reviews.length === 1 ? "" : "s"} total${pendingCount > 0 ? ` — ${pendingCount} awaiting approval` : ""}`}
      />

      <div className="rounded-sm border border-beige bg-white">
        {reviews.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No reviews yet.
          </Text>
        ) : (
          <ul className="divide-y divide-beige">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-body text-sm font-semibold text-primary">
                      {review.productName}
                    </span>
                    <Badge variant={review.isApproved ? "success" : "warning"}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    {review.isVerifiedPurchase && (
                      <Badge variant="outline">Verified Purchase</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={review.rating} />
                    <span className="font-body text-sm font-medium text-primary">
                      {review.customerName}
                    </span>
                    <span className="font-body text-xs text-muted">
                      {dateFormatter.format(new Date(review.reviewDate))}
                    </span>
                  </div>
                  <p className="max-w-2xl font-body text-sm text-primary">
                    {review.reviewText}
                  </p>
                </div>
                <ReviewModerationActions
                  reviewId={review.id}
                  isApproved={review.isApproved}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
