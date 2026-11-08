import Link from "next/link";
import { Quote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { RatingStars } from "@/components/shared/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getFeaturedTestimonials } from "@/lib/services/reviewService";
import type { Testimonial } from "@/types";
import type { ReviewsLayoutId } from "@/types/layoutTemplate";

interface ReviewsSectionProps {
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "grid" look. */
  layout?: ReviewsLayoutId;
}

/**
 * Pulls real, named reviews from the reviews table (see
 * reviewService.getFeaturedTestimonials) rather than placeholder content —
 * renders nothing once the store has fewer than 3 reviews worth featuring,
 * same as the rest of the homepage never shows unsupported social proof.
 */
export async function ReviewsSection({
  layout = "grid",
}: ReviewsSectionProps) {
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

      {layout === "carousel" && (
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}

      {layout === "spotlight" && testimonials[0] && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:flex-[2]">
            <ReviewCard review={testimonials[0]} featured />
          </div>
          <div className="flex flex-col gap-6 lg:flex-1">
            {testimonials.slice(1, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {layout === "masonry" && (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {testimonials.map((review) => (
            <div key={review.id} className="mb-6 break-inside-avoid">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="mx-auto flex max-w-2xl flex-col divide-y divide-beige">
          {testimonials.map((review) => (
            <div key={review.id} className="flex flex-col gap-3 py-6">
              <RatingStars rating={review.rating} />
              <blockquote className="font-body text-base leading-relaxed text-primary">
                &ldquo;{review.reviewText}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-semibold text-primary">
                  {review.customerName}
                </span>
                <span className="text-muted">&middot;</span>
                <span className="truncate font-body text-xs text-muted">
                  {review.purchasedProduct}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "grid" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {layout === "compact" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {testimonials.map((review) => (
            <ReviewCard key={review.id} review={review} compact />
          ))}
        </div>
      )}

      {layout === "quote" && testimonials[0] && (
        <div className="flex flex-col gap-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Quote className="h-10 w-10 text-gold/40" aria-hidden="true" fill="currentColor" />
            <blockquote className="font-body text-xl leading-relaxed text-primary sm:text-2xl">
              &ldquo;{testimonials[0].reviewText}&rdquo;
            </blockquote>
            <RatingStars rating={testimonials[0].rating} />
            <span className="font-heading text-sm font-semibold text-primary">
              {testimonials[0].customerName}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(1).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {layout === "marquee" && (
        <ReviewsMarquee testimonials={testimonials} />
      )}

      {layout === "avatar" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-3 rounded-sm border border-beige bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 font-heading text-base font-semibold text-gold">
                  {review.customerName.charAt(0).toUpperCase()}
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-sm font-semibold text-primary">
                    {review.customerName}
                  </span>
                  <RatingStars rating={review.rating} starClassName="h-3.5 w-3.5" />
                </div>
              </div>
              <blockquote className="font-body text-sm leading-relaxed text-primary">
                &ldquo;{review.reviewText}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      )}

      {layout === "highlight" && (
        <div className="flex flex-col gap-10">
          <div className="mx-auto flex flex-col items-center gap-2 rounded-2xl bg-primary px-8 py-6 text-center text-white">
            <span className="font-heading text-4xl font-semibold text-gold">
              {averageRating.toFixed(1)}★
            </span>
            <span className="font-body text-sm text-white/80">
              from {testimonials.length}+ happy ZOQ&apos;s Gallery customers
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function ReviewsMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  const item = (
    <div className="flex items-center gap-6">
      {testimonials.map((review) => (
        <div
          key={review.id}
          className="mx-3 flex w-80 shrink-0 items-center gap-3 rounded-sm border border-beige bg-white px-5 py-4"
        >
          <RatingStars rating={review.rating} starClassName="h-3.5 w-3.5" />
          <blockquote className="line-clamp-1 font-body text-sm text-primary">
            &ldquo;{review.reviewText}&rdquo;
          </blockquote>
        </div>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden">
      <div className="flex w-max animate-marquee">
        {item}
        {item}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  featured = false,
  compact = false,
}: {
  review: Testimonial;
  featured?: boolean;
  compact?: boolean;
}) {
  const card = (
    <figure
      className={cn(
        "group flex h-full flex-col gap-4 rounded-sm border border-beige bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        featured ? "p-8 sm:p-10" : compact ? "p-5" : "p-7",
      )}
    >
      <Quote
        className={featured ? "h-9 w-9 text-gold/40" : compact ? "h-5 w-5 text-gold/40" : "h-7 w-7 text-gold/40"}
        aria-hidden="true"
        fill="currentColor"
      />
      <blockquote
        className={cn(
          "flex-1 font-body leading-relaxed text-primary",
          featured
            ? "text-lg sm:text-xl"
            : compact
              ? "line-clamp-3 text-sm"
              : "text-[0.95rem]",
        )}
      >
        &ldquo;{review.reviewText}&rdquo;
      </blockquote>
      <figcaption className="flex flex-col gap-2 border-t border-beige pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-sm font-semibold text-primary">
            {review.customerName}
          </span>
          <RatingStars rating={review.rating} />
        </div>
        {!compact && (
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
        )}
      </figcaption>
    </figure>
  );

  if (!review.productSlug) return card;

  return (
    <Link
      href={`/product/${review.productSlug}`}
      className="block h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      aria-label={`See ${review.purchasedProduct}, reviewed by ${review.customerName}`}
    >
      {card}
    </Link>
  );
}
