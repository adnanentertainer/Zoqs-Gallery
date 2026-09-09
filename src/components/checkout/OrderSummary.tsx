import {
  CheckoutItem,
  type CheckoutItemData,
} from "@/components/checkout/CheckoutItem";
import { CheckoutTotals } from "@/components/checkout/CheckoutTotals";
import { formatPrice } from "@/lib/utils";
import {
  calculateShippingCost,
  type ShippingSettings,
} from "@/lib/checkout/shipping";

interface OrderSummaryProps {
  items: CheckoutItemData[];
  subtotal: number;
  shippingSettings: ShippingSettings;
}

export function OrderSummary({
  items,
  subtotal,
  shippingSettings,
}: OrderSummaryProps) {
  const shippingCost = calculateShippingCost(subtotal, shippingSettings);
  const total = subtotal + shippingCost;
  const qualifiesForFreeShipping = shippingCost === 0;

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-beige p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        Order Summary
      </h2>

      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <CheckoutItem key={item.key} item={item} />
        ))}
      </div>

      {!qualifiesForFreeShipping && (
        <p className="font-body text-xs text-muted">
          Add {formatPrice(shippingSettings.freeShippingThreshold - subtotal)}{" "}
          more to qualify for free shipping.
        </p>
      )}

      <CheckoutTotals
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
      />
    </div>
  );
}
