import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ShippingProgress } from "@/components/cart/ShippingProgress";
import { cn, formatPrice } from "@/lib/utils";
import type { FreeShippingProgress } from "@/lib/cart";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";
import type { SaleOffer } from "@/types/saleOffer";

interface CartSummaryProps {
  subtotal: number;
  freeShipping: FreeShippingProgress;
  freeShippingSuspended: boolean;
  /** Same settings/amount checkout's OrderSummary already shows — so the
   * cart previews the exact same discount before the shopper even reaches
   * checkout, instead of only revealing it there. */
  blessedFridayOffer: BlessedFridayOffer;
  blessedFridayDiscount: number;
  /** The general sitewide Sale — overrides Blessed Friday's messaging and
   * discount above whenever `saleActive` is true. See lib/checkout/sale.ts. */
  saleOffer: SaleOffer;
  saleActive: boolean;
  saleDiscount: number;
  secondaryAction: { label: string; href: string };
  onNavigate?: () => void;
  className?: string;
  /** The rule above Subtotal — on by default (the full cart page has
   * nothing else to separate the item-count line from the totals block).
   * Turned off in the cart drawer, which already wraps this component in
   * its own top border to separate the scrollable item list from the
   * footer — showing both left two rules stacked with nothing between them
   * once ShippingProgress is hidden (see `hidden` below). */
  showTopDivider?: boolean;
}

export function CartSummary({
  subtotal,
  freeShipping,
  freeShippingSuspended,
  blessedFridayOffer,
  blessedFridayDiscount,
  saleOffer,
  saleActive,
  saleDiscount,
  secondaryAction,
  onNavigate,
  className,
  showTopDivider = true,
}: CartSummaryProps) {
  const discountAmount = saleActive ? saleDiscount : blessedFridayDiscount;
  const discountLabel = saleActive
    ? `${saleOffer.name.trim() || "Sale"} (${saleOffer.discountPercentage}% off)`
    : `Blessed Friday Offer (${blessedFridayOffer.discountPercentage}% off)`;
  const total = subtotal - discountAmount + freeShipping.shippingCost;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ShippingProgress
        progress={freeShipping}
        hidden={freeShippingSuspended}
      />

      {saleActive ? (
        saleDiscount > 0 ? (
          <p className="font-body text-xs font-medium text-success">
            {saleOffer.name.trim() || "Sale"} applied —{" "}
            {saleOffer.discountPercentage}% off
            {freeShipping.enabled ? " + free shipping" : ""} on orders of{" "}
            {formatPrice(saleOffer.minSpend)} and above.
          </p>
        ) : (
          <p className="font-body text-xs text-muted">
            Add {formatPrice(saleOffer.minSpend - subtotal)} more to unlock{" "}
            {saleOffer.discountPercentage}% off
            {freeShipping.enabled ? " + free shipping" : ""} with our{" "}
            {saleOffer.name.trim() || "sale"}.
          </p>
        )
      ) : (
        blessedFridayOffer.enabled &&
        (blessedFridayDiscount > 0 ? (
          <p className="font-body text-xs font-medium text-success">
            Blessed Friday offer applied — {blessedFridayOffer.discountPercentage}
            % off{freeShipping.enabled ? " + free shipping" : ""} on orders of{" "}
            {formatPrice(blessedFridayOffer.minSpend)} and above.
          </p>
        ) : (
          <p className="font-body text-xs text-muted">
            Add {formatPrice(blessedFridayOffer.minSpend - subtotal)} more to
            unlock {blessedFridayOffer.discountPercentage}% off
            {freeShipping.enabled ? " + free shipping" : ""} with our Blessed
            Friday offer.
          </p>
        ))
      )}

      <div
        className={cn(
          "flex flex-col gap-2",
          showTopDivider && "border-t border-beige pt-4",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-muted">Subtotal</span>
          <span className="font-body text-sm text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-success">
              {discountLabel}
            </span>
            <span className="font-body text-sm text-success">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-muted">Shipping</span>
          <span className="font-body text-sm text-primary">
            {freeShipping.qualifies
              ? "Free"
              : formatPrice(freeShipping.shippingCost)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-base font-medium text-primary">
            Total
          </span>
          <span className="font-heading text-xl font-semibold text-primary">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          // Login/register prompt (/checkout/start) is disabled — go
          // straight to checkout so guests aren't asked to sign in first.
          href="/checkout"
          onClick={onNavigate}
          className={buttonVariants("gold", "lg", "w-full")}
        >
          Checkout
        </Link>
        <Link
          href={secondaryAction.href}
          onClick={onNavigate}
          className={buttonVariants("outline-gold", "lg", "w-full")}
        >
          {secondaryAction.label}
        </Link>
      </div>
    </div>
  );
}
