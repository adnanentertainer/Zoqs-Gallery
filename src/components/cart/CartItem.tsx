import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart, type CartLineItem } from "@/context/CartContext";
import { getVariantSummaryLabel } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartLineItem;
}

export function CartItem({ item }: CartItemProps) {
  const { setItemQuantity, removeItem } = useCart();
  const variantLabel = getVariantSummaryLabel(
    item.product,
    item.selectedVariants,
  );

  return (
    <div className="flex gap-4 border-b border-beige py-4 last:border-b-0">
      <Link
        href={`/product/${item.product.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-24 sm:w-24"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${item.product.slug}`}
            className="line-clamp-2 rounded-sm font-body text-sm font-medium text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {item.product.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            aria-label={`Remove ${item.product.name} from cart`}
            className="shrink-0 rounded-sm p-1 text-muted transition-colors hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {variantLabel && (
          <span className="font-body text-xs text-muted">{variantLabel}</span>
        )}

        <span className="font-body text-sm text-primary">
          {formatPrice(item.unitPrice)}
        </span>

        <div className="mt-1 flex items-center justify-between gap-3">
          <QuantitySelector
            value={item.quantity}
            max={Math.max(item.product.stock, 1)}
            onChange={(next) => setItemQuantity(item.key, next)}
            label={`Quantity for ${item.product.name}`}
            compact
          />
          <span className="font-body text-sm font-semibold text-primary">
            {formatPrice(item.lineSubtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
