import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ShippingProgress } from "@/components/cart/ShippingProgress";
import { cn, formatPrice } from "@/lib/utils";
import type { FreeShippingProgress } from "@/lib/cart";

interface CartSummaryProps {
  subtotal: number;
  freeShipping: FreeShippingProgress;
  freeShippingSuspended: boolean;
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
  secondaryAction,
  onNavigate,
  className,
  showTopDivider = true,
}: CartSummaryProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ShippingProgress
        progress={freeShipping}
        hidden={freeShippingSuspended}
      />

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
            {formatPrice(subtotal + freeShipping.shippingCost)}
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
          className={buttonVariants("outline", "lg", "w-full")}
        >
          {secondaryAction.label}
        </Link>
      </div>
    </div>
  );
}
