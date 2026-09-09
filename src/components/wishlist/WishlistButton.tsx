"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistButtonProps {
  productSlug: string;
  productName: string;
  className?: string;
  iconClassName?: string;
}

export function WishlistButton({
  productSlug,
  productName,
  className,
  iconClassName,
}: WishlistButtonProps) {
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(productSlug);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(productSlug, productName);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wishlisted}
      aria-label={
        wishlisted
          ? `Remove ${productName} from wishlist`
          : `Add ${productName} to wishlist`
      }
      className={className}
    >
      <Heart
        className={cn(iconClassName, wishlisted && "fill-gold text-gold")}
        aria-hidden="true"
      />
    </button>
  );
}
