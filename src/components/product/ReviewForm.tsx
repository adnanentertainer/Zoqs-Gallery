"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { RatingStarsInput } from "@/components/product/RatingStarsInput";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { submitReviewAction } from "@/app/product/[slug]/actions";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-sm border border-beige bg-secondary/40 p-6 text-center">
        <p className="font-body text-sm text-primary">
          <Link
            href="/login"
            className="font-semibold text-gold underline underline-offset-2"
          >
            Log in
          </Link>{" "}
          to write a review.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <AuthMessage
        variant="success"
        message="Thanks for your review! It'll appear here once we've approved it."
      />
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const result = await submitReviewAction(
      productId,
      productSlug,
      rating,
      reviewText,
    );

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-sm border border-beige p-6"
    >
      <h3 className="font-heading text-lg font-semibold text-primary">
        Write a Review
      </h3>
      {error && <AuthMessage variant="error" message={error} />}
      <div className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-primary">
          Your rating
        </span>
        <RatingStarsInput value={rating} onChange={setRating} />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="review-text"
          className="font-body text-sm font-medium text-primary"
        >
          Your review
        </label>
        <textarea
          id="review-text"
          rows={4}
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        disabled={rating === 0 || !reviewText.trim()}
        className="w-fit"
      >
        Submit Review
      </Button>
    </form>
  );
}
