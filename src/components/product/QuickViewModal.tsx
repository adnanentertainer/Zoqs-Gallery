"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/Typography";
import { RatingStars } from "@/components/shared/RatingStars";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { categoryLabel, formatPrice } from "@/lib/utils";
import { getDefaultVariantSelections } from "@/lib/cart";
import {
  getDiscountPercentage,
  getProductBadge,
  isInStock,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
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

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const cart = useCart();
  const open = product !== null;

  useEscapeKey(open, onClose);
  useBodyScrollLock(open);

  if (!product) return null;

  const badge = getProductBadge(product);
  const inStock = isInStock(product);
  const discount = getDiscountPercentage(product);

  function handleAddToCart() {
    if (!product || !inStock) return;
    cart.addItem(product, 1, getDefaultVariantSelections(product));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-primary/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-sm bg-white shadow-xl sm:flex-row sm:max-h-[85vh]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-colors hover:bg-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative aspect-[3/4] w-full shrink-0 bg-beige sm:w-1/2">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className={!inStock ? "object-cover opacity-60" : "object-cover"}
          />
          {badge && (
            <Badge
              variant={badgeVariant[badge]}
              className="absolute left-3 top-3"
            >
              {badge}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-6 sm:w-1/2">
          <span className="font-body text-xs uppercase tracking-wide text-muted">
            {categoryLabel(product.categorySlug)}
          </span>
          <Heading variant="h3" as="h2" id="quick-view-title">
            {product.name}
          </Heading>
          <div className="flex items-center gap-1.5">
            <RatingStars rating={product.rating} />
            <span className="font-body text-xs text-muted">
              ({product.reviewsCount})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-lg font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-body text-sm text-muted line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount !== undefined && (
              <span className="font-body text-sm font-medium text-error">
                -{discount}%
              </span>
            )}
          </div>
          {product.shortDescription && (
            <Text variant="bodySm" className="text-muted">
              {product.shortDescription}
            </Text>
          )}

          <div className="mt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!inStock}
              onClick={handleAddToCart}
              leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
              className="flex-1"
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <WishlistButton
              productSlug={product.slug}
              productName={product.name}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-beige text-primary transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              iconClassName="h-4 w-4"
            />
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="mt-1 font-body text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-gold"
          >
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
