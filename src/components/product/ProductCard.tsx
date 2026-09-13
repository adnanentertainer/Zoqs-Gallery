"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type MouseEvent } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/shared/RatingStars";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";
import { getDefaultVariantSelections } from "@/lib/cart";
import {
  getDiscountPercentage,
  getProductBadge,
  isInStock,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { registerProduct } from "@/lib/productCache";
import type { Product, ProductBadge } from "@/types";

const badgeVariant: Record<
  ProductBadge,
  "gold" | "default" | "error" | "outline" | "warning"
> = {
  New: "gold",
  "Best Seller": "default",
  Sale: "error",
  "Limited Stock": "warning",
  "Out of Stock": "outline",
};

const iconButtonStyles =
  "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary opacity-90 shadow-sm transition-colors hover:bg-gold hover:text-white hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-40";

function preventCardNavigation(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const badge = getProductBadge(product);
  const inStock = isInStock(product);
  const [primaryImage, secondaryImage = primaryImage] = product.images;
  const cart = useCart();

  useEffect(() => {
    registerProduct(product);
  }, [product]);

  function handleAddToCart(event: MouseEvent) {
    preventCardNavigation(event);
    if (!inStock) return;
    cart.addItem(product, 1, getDefaultVariantSelections(product));
  }

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-sm bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          className={cn(
            "object-cover transition-opacity duration-500",
            !inStock && "opacity-60",
            "group-hover:opacity-0",
          )}
        />
        <Image
          src={secondaryImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          className={cn(
            "object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            !inStock && "group-hover:opacity-60",
          )}
        />

        {badge && (
          <Badge
            variant={badgeVariant[badge]}
            className="absolute left-3 top-3"
          >
            {badge}
          </Badge>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <WishlistButton
            productSlug={product.slug}
            productName={product.name}
            className={iconButtonStyles}
            iconClassName="h-4 w-4"
          />
          <button
            type="button"
            onClick={preventCardNavigation}
            aria-label={`Quick view ${product.name}`}
            className={iconButtonStyles}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={
              inStock
                ? `Add ${product.name} to cart`
                : `${product.name} is out of stock`
            }
            className={iconButtonStyles}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        <span className="font-body text-xs uppercase tracking-wide text-muted">
          {categoryLabel(product.categorySlug)}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 rounded-sm font-body text-sm font-medium text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="font-body text-xs text-muted">
            ({product.reviewsCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-body text-xs text-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {getDiscountPercentage(product) !== undefined && (
            <span className="font-body text-xs font-medium text-error">
              -{getDiscountPercentage(product)}%
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
