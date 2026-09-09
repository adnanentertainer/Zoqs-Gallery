import { formatPrice } from "@/lib/utils";

interface CheckoutTotalsProps {
  subtotal: number;
  shippingCost: number;
  total: number;
}

export function CheckoutTotals({
  subtotal,
  shippingCost,
  total,
}: CheckoutTotalsProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-beige pt-4">
      <div className="flex items-center justify-between font-body text-sm text-primary">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between font-body text-sm text-primary">
        <span>Shipping</span>
        <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-beige pt-3">
        <span className="font-body text-base font-medium text-primary">
          Total
        </span>
        <span className="font-heading text-xl font-semibold text-primary">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
