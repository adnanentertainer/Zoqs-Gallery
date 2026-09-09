import { formatPrice } from "@/lib/utils";
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
        className={
          size === "lg"
            ? "font-heading text-2xl font-semibold text-primary sm:text-3xl"
            : "font-heading text-xl font-semibold text-primary"
        }
      >
        {formatPrice(currentPrice)}
      </span>
      {isBasePrice && product.originalPrice && (
        <span className="font-body text-base text-muted line-through">
          {formatPrice(product.originalPrice)}
        </span>
      )}
      {discount !== undefined && (
        <span className="font-body text-sm font-semibold text-error">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
