import { formatPrice } from "@/lib/utils";

interface CheckoutTotalsProps {
  subtotal: number;
  shippingCost: number;
  total: number;
  /** Present on every discount display site — live checkout preview, order
   * confirmation, and admin order detail — so the same "Subtotal → Promo →
   * Shipping → Total" layout appears everywhere a total is shown. */
  discountAmount?: number;
  promoCode?: string | null;
}

export function CheckoutTotals({
  subtotal,
  shippingCost,
  total,
  discountAmount = 0,
  promoCode,
}: CheckoutTotalsProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-beige pt-4">
      <div className="flex items-center justify-between font-body text-sm text-primary">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex items-center justify-between font-body text-sm text-success">
          <span>Promo{promoCode ? ` (${promoCode})` : ""}</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
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
