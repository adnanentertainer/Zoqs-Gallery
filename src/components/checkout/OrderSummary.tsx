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
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";

interface OrderSummaryProps {
  items: CheckoutItemData[];
  subtotal: number;
  /** Already reflects the Blessed Friday / promo-code override, if either
   * applies — see CheckoutForm, which raises freeShippingThreshold past
   * reach so the evergreen perk is suspended whenever a discount is live. */
  shippingSettings: ShippingSettings;
  /** The larger of the entered promo code's discount and the automatic
   * Blessed Friday discount — never both added together. */
  discountAmount?: number;
  promoCode?: string | null;
  discountLabel?: string;
  blessedFridayOffer: BlessedFridayOffer;
}

export function OrderSummary({
  items,
  subtotal,
  shippingSettings,
  discountAmount = 0,
  promoCode,
  discountLabel,
  blessedFridayOffer,
}: OrderSummaryProps) {
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost = calculateShippingCost(
    discountedSubtotal,
    shippingSettings,
  );
  const total = discountedSubtotal + shippingCost;
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

      {blessedFridayOffer.enabled ? (
        discountAmount > 0 ? (
          <p className="font-body text-xs font-medium text-success">
            Blessed Friday offer applied — {blessedFridayOffer.discountPercentage}
            % off on orders of {formatPrice(blessedFridayOffer.minSpend)} and
            above.
          </p>
        ) : (
          <p className="font-body text-xs text-muted">
            Add{" "}
            {formatPrice(blessedFridayOffer.minSpend - subtotal)} more to
            unlock {blessedFridayOffer.discountPercentage}% off with our
            Blessed Friday offer.
          </p>
        )
      ) : promoCode ? (
        <p className="font-body text-xs text-muted">
          Free shipping isn&apos;t available together with a promo code.
        </p>
      ) : qualifiesForFreeShipping ? (
        <p className="font-body text-xs font-medium text-success">
          Free shipping unlocked.
        </p>
      ) : (
        <p className="font-body text-xs text-muted">
          Add{" "}
          {formatPrice(
            shippingSettings.freeShippingThreshold - discountedSubtotal,
          )}{" "}
          more to qualify for free shipping.
        </p>
      )}

      <CheckoutTotals
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
        discountAmount={discountAmount}
        promoCode={promoCode}
        discountLabel={discountLabel}
        showTopDivider={false}
      />
    </div>
  );
}
