import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ShippingProgress } from "@/components/cart/ShippingProgress";
import { cn, formatPrice } from "@/lib/utils";
import type { FreeShippingProgress } from "@/lib/cart";

interface CartSummaryProps {
  subtotal: number;
  freeShipping: FreeShippingProgress;
  secondaryAction: { label: string; href: string };
  onNavigate?: () => void;
  className?: string;
}

export function CartSummary({
  subtotal,
  freeShipping,
  secondaryAction,
  onNavigate,
  className,
}: CartSummaryProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ShippingProgress progress={freeShipping} />

      <div className="flex items-center justify-between border-t border-beige pt-4">
        <span className="font-body text-base font-medium text-primary">
          Subtotal
        </span>
        <span className="font-heading text-xl font-semibold text-primary">
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Link
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
