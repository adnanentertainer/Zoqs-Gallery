import { cn, formatPrice } from "@/lib/utils";
import { getDiscountPercentage } from "@/lib/products";
import type { Product } from "@/types";

interface ProductPriceProps {
  product: Product;
  price?: number;
  size?: "md" | "lg";
}

export function ProductPrice({
  product,
  price,
  size = "lg",
}: ProductPriceProps) {
  const currentPrice = price ?? product.price;
  const isBasePrice = currentPrice === product.price;
  const discount = isBasePrice ? getDiscountPercentage(product) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={cn(
          "font-heading font-semibold",
          size === "lg" ? "text-2xl sm:text-3xl" : "text-xl",
          discount !== undefined ? "text-success" : "text-primary",
        )}
      >
        {formatPrice(currentPrice)}
      </span>
      {isBasePrice && product.originalPrice && (
        <span className="font-body text-base text-muted line-through">
          {formatPrice(product.originalPrice)}
        </span>
      )}
      {discount !== undefined && (
        <span className="inline-flex items-center rounded-full bg-error px-2.5 py-1 font-body text-xs font-semibold text-white">
          -{discount}%
        </span>
      )}
    </div>
  );
}
