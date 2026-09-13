"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Share2, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VariantSelector } from "@/components/product/VariantSelector";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { ProductPrice } from "@/components/product/ProductPrice";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { formatPrice } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD, isInStock } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useProductVariantSelection } from "@/context/ProductVariantImageContext";
import { registerProduct } from "@/lib/productCache";
import type { Product } from "@/types";

type CartStatus = "idle" | "loading" | "added";

const iconButtonStyles =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-beige text-primary transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const cart = useCart();
  const router = useRouter();
  const { selections, setSelections } = useProductVariantSelection();
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<CartStatus>("idle");
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareFallbackUrl, setShareFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    registerProduct(product);
  }, [product]);

  const selectedOptions = (product.variants ?? []).map((group) =>
    group.options.find((option) => option.value === selections[group.type])!,
  );
  const variantOutOfStock = selectedOptions.some(
    (option) => option.inStock === false,
  );
  const priceOverride = selectedOptions.find(
    (option) => option.priceOverride !== undefined,
  )?.priceOverride;
  const currentPrice = priceOverride ?? product.price;
  const productInStock = isInStock(product);
  const canPurchase = productInStock && !variantOutOfStock;
  const maxQuantity = Math.max(1, product.stock);

  function handleAddToCart() {
    if (!canPurchase) return;
    cart.addItem(product, quantity, selections, { silent: true });
    setCartStatus("loading");
    window.setTimeout(() => {
      setCartStatus("added");
      window.setTimeout(() => setCartStatus("idle"), 2200);
    }, 500);
  }

  function handleBuyNow() {
    if (!canPurchase) return;
    cart.addItem(product, quantity, selections, { silent: true });
    router.push("/checkout/start");
  }

  async function handleShare() {
    const shareData = {
      title: product.name,
      text: product.description,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user dismissed the native share sheet
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      // Clipboard write failed (unsupported browser, denied permission, etc).
      // Fall back to showing the link so the user can copy it manually.
      setShareFallbackUrl(shareData.url);
      window.setTimeout(() => setShareFallbackUrl(null), 8000);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {(product.variants ?? []).map((group) => (
        <VariantSelector
          key={group.type}
          group={group}
          selectedValue={selections[group.type]}
          onSelect={(value) =>
            setSelections((prev) => ({ ...prev, [group.type]: value }))
          }
        />
      ))}

      {priceOverride !== undefined && (
        <ProductPrice product={product} price={currentPrice} size="md" />
      )}

      <div className="flex flex-wrap items-end gap-6">
        <QuantitySelector
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
        />
        {canPurchase &&
          productInStock &&
          product.stock <= LOW_STOCK_THRESHOLD && (
            <span className="pb-3 font-body text-sm font-medium text-error">
              Only {product.stock} left in stock
            </span>
          )}
        {variantOutOfStock && (
          <span className="pb-3 font-body text-sm font-medium text-error">
            This option is out of stock
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            isLoading={cartStatus === "loading"}
            disabled={!canPurchase}
          >
            {cartStatus === "added" ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Add to Cart
              </>
            )}
          </Button>
          <WishlistButton
            productSlug={product.slug}
            productName={product.name}
            className={iconButtonStyles}
            iconClassName="h-5 w-5"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="gold"
            size="lg"
            className="flex-1"
            onClick={handleBuyNow}
            disabled={!canPurchase}
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Buy Now
          </Button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this product"
            className={iconButtonStyles}
          >
            {linkCopied ? (
              <Check className="h-5 w-5 text-success" aria-hidden="true" />
            ) : (
              <Share2 className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div aria-live="polite" className="min-h-5">
          {linkCopied && (
            <p className="font-body text-sm text-success">Link copied!</p>
          )}
          {shareFallbackUrl && (
            <p className="break-all font-body text-sm text-muted">
              Couldn&apos;t copy automatically — copy this link:{" "}
              <span className="underline">{shareFallbackUrl}</span>
            </p>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-beige bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(31,31,31,0.08)] backdrop-blur lg:hidden">
        <div className="flex flex-col leading-tight">
          <span className="font-body text-[0.65rem] uppercase tracking-wide text-muted">
            Price
          </span>
          <span className="font-heading text-lg font-semibold text-primary">
            {formatPrice(currentPrice)}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="flex-1"
          onClick={handleAddToCart}
          isLoading={cartStatus === "loading"}
          disabled={!canPurchase}
        >
          {cartStatus === "added" ? "Added" : "Add to Cart"}
        </Button>
        <Button
          type="button"
          variant="gold"
          size="md"
          className="flex-1"
          onClick={handleBuyNow}
          disabled={!canPurchase}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
