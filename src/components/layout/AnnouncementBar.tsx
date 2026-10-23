import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";
import { getBlessedFridayOffer } from "@/lib/services/blessedFridayOfferService";
import { getActivePromoCodeSummary } from "@/lib/services/promoCodeService";

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
  // Blessed Friday takes priority — it's the bigger, code-free promise (free
  // delivery still applies at the same threshold alongside it — see
  // create_order() / layout.tsx). A running promo code is announced next,
  // ahead of the generic default, since there's otherwise nowhere on the
  // site that tells a visitor a code exists at all.
  const [blessedFridayOffer, activePromoCode] = await Promise.all([
    getBlessedFridayOffer(),
    getActivePromoCodeSummary(),
  ]);

  const message = blessedFridayOffer.enabled
    ? `Blessed Friday Offer — ${blessedFridayOffer.discountPercentage}% Off Orders ${formatPrice(blessedFridayOffer.minSpend)} and Above`
    : activePromoCode
      ? promoCodeMessage(activePromoCode)
      : siteConfig.announcement;

  return (
    <div className="bg-primary py-2.5 text-center">
      <p className="px-4 font-body text-xs tracking-wide text-white sm:text-sm">
        {message}
      </p>
    </div>
  );
}
