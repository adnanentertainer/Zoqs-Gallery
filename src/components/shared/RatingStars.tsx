import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

export function RatingStars({
  rating,
  className,
  starClassName,
}: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const position = index + 1;
        if (position <= rounded) {
          return (
            <Star
              key={index}
              aria-hidden="true"
              className={cn("h-3.5 w-3.5 fill-gold text-gold", starClassName)}
            />
          );
        }
        if (position - 0.5 === rounded) {
          return (
            <StarHalf
              key={index}
              aria-hidden="true"
              className={cn("h-3.5 w-3.5 fill-gold text-gold", starClassName)}
            />
          );
        }
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn("h-3.5 w-3.5 fill-none text-beige", starClassName)}
          />
        );
      })}
    </div>
  );
}
