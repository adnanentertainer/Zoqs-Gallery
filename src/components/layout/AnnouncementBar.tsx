import { formatPrice } from "@/lib/utils";
import { getBlessedFridayOffer } from "@/lib/services/blessedFridayOfferService";
import { getSaleOffer } from "@/lib/services/saleOfferService";
import { resolveDisplayOffer } from "@/lib/checkout/sale";
import { getActivePromoCodeSummary } from "@/lib/services/promoCodeService";
import { getShippingSettings } from "@/lib/checkout/getShippingSettings";

function promoCodeMessage(
  promo: NonNullable<Awaited<ReturnType<typeof getActivePromoCodeSummary>>>,
): string {
  const discount =
    promo.discountType === "percentage"
      ? `${promo.discountValue}% Off`
      : `${formatPrice(promo.discountValue)} Off`;
  return `${promo.description ? `${promo.description} — ` : ""}${discount} with Code ${promo.code}`;
}

export async function AnnouncementBar() {
  // The Sale takes priority over Blessed Friday whenever it's active (see
  // lib/checkout/sale.ts), and whichever of those is live takes priority
  // over everything else here — it's the bigger, code-free promise (free
  // delivery still applies at the same threshold alongside it — see
  // create_order() / layout.tsx). A running promo code is announced next,
  // ahead of the generic default, since there's otherwise nowhere on the
  // site that tells a visitor a code exists at all.
  const [blessedFridayOffer, saleOffer, activePromoCode, shippingSettings] =
    await Promise.all([
      getBlessedFridayOffer(),
      getSaleOffer(),
      getActivePromoCodeSummary(),
      getShippingSettings(),
    ]);
  const displayOffer = resolveDisplayOffer(saleOffer, blessedFridayOffer);

  // The generic default banner is just a restatement of the admin-configured
  // free shipping threshold/toggle (Admin → Settings) — computed here
  // instead of a hardcoded constant so it can never drift out of sync with
  // what create_order() actually charges, the same bug class fixed in
  // DeliveryInfo/OrderSummary/CartSummary (see
  // 20261029000000_configurable_free_shipping_offers.sql).
  const defaultMessage = shippingSettings.freeShippingEnabledNormalOrders
    ? `Free Delivery on Orders ${formatPrice(shippingSettings.freeShippingThreshold)} and Above`
    : `Flat Rate Shipping — ${formatPrice(shippingSettings.flatShippingCost)} on All Orders`;

  const message = displayOffer.enabled
    ? `${displayOffer.label} — ${displayOffer.discountPercentage}% Off Orders ${formatPrice(displayOffer.minSpend)} and Above${shippingSettings.freeShippingEnabledOffers ? " + Free Shipping" : ""}`
    : activePromoCode
      ? promoCodeMessage(activePromoCode)
      : defaultMessage;

  return (
    <div className="bg-primary py-2.5 text-center">
      <p className="px-4 font-body text-xs tracking-wide text-white sm:text-sm">
        {message}
      </p>
    </div>
  );
}
