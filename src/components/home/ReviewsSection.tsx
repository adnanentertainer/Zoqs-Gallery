import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { RatingStars } from "@/components/shared/RatingStars";
import { featuredReviews } from "@/data/reviews";

export function ReviewsSection() {
  return (
    <Section
      title="Customer Reviews"
      subtitle="Real experiences from ZOQ's Gallery customers across Pakistan."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredReviews.map((review) => (
          <figure
            key={review.id}
            className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6"
          >
            <Quote className="h-6 w-6 text-gold" aria-hidden="true" />
            <RatingStars rating={review.rating} />
            <blockquote className="font-body text-sm text-primary">
              &ldquo;{review.reviewText}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex flex-col gap-0.5">
              <span className="font-body text-sm font-semibold text-primary">
                {review.customerName}
              </span>
              <span className="font-body text-xs text-muted">
                Purchased: {review.purchasedProduct}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
