import Link from "next/link";
import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { RatingStars } from "@/components/shared/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { getFeaturedTestimonials } from "@/lib/services/reviewService";

/**
 * Pulls real, named reviews from the reviews table (see
 * reviewService.getFeaturedTestimonials) rather than placeholder content —
 * renders nothing once the store has fewer than 3 reviews worth featuring,
 * same as the rest of the homepage never shows unsupported social proof.
 */
export async function ReviewsSection() {
  const testimonials = await getFeaturedTestimonials(6);
  if (testimonials.length < 3) return null;

  const averageRating =
    testimonials.reduce((sum, item) => sum + item.rating, 0) /
    testimonials.length;

  return (
    <Section title="Loved By Our Customers">
      <div className="mb-10 flex flex-col items-center gap-2 sm:mb-12">
        <div className="flex items-center gap-2">
          <RatingStars rating={averageRating} starClassName="h-5 w-5" />
          <span className="font-heading text-lg font-semibold text-primary">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <p className="font-body text-sm text-muted">
          Based on real reviews from ZOQ&apos;s Gallery customers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((review) => {
          const card = (
            <figure className="group flex h-full flex-col gap-4 rounded-sm border border-beige bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <Quote
                className="h-7 w-7 text-gold/40"
                aria-hidden="true"
                fill="currentColor"
              />
              <blockquote className="flex-1 font-body text-[0.95rem] leading-relaxed text-primary">
                &ldquo;{review.reviewText}&rdquo;
              </blockquote>
              <figcaption className="flex flex-col gap-2 border-t border-beige pt-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading text-sm font-semibold text-primary">
                    {review.customerName}
                  </span>
                  <RatingStars rating={review.rating} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="truncate font-body text-xs text-muted">
                    {review.purchasedProduct}
                  </span>
                  {review.verifiedPurchase && (
                    <Badge variant="success" className="shrink-0">
                      Verified Buyer
                    </Badge>
                  )}
                </div>
              </figcaption>
            </figure>
          );

          return (
            <div key={review.id}>
              {review.productSlug ? (
                <Link
                  href={`/product/${review.productSlug}`}
                  className="block h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                  aria-label={`See ${review.purchasedProduct}, reviewed by ${review.customerName}`}
                >
                  {card}
                </Link>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
