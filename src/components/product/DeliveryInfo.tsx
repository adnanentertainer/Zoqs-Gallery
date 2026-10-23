import { Banknote, Package, RotateCcw, Truck } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";

interface DeliveryInfoProps {
  blessedFridayOffer: BlessedFridayOffer;
}

export function DeliveryInfo({ blessedFridayOffer }: DeliveryInfoProps) {
  // Free delivery still applies at the same threshold while Blessed Friday
  // is on (see create_order() / layout.tsx) — this just swaps which single
  // badge shows in this slot, favoring the more informative "X% off" offer
  // over the plainer free-delivery one since they share the same threshold.
  const thirdItem = blessedFridayOffer.enabled
    ? {
        icon: Package,
        title: "Blessed Friday Offer",
        description: `${blessedFridayOffer.discountPercentage}% off orders of ${formatPrice(blessedFridayOffer.minSpend)} and above.`,
      }
    : {
        icon: Package,
        title: "Free Delivery",
        description: `On orders above ${formatPrice(siteConfig.freeShippingThreshold)}.`,
      };

  const deliveryItems = [
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: `We deliver across ${siteConfig.country}.`,
    },
    {
      icon: Banknote,
      title: "Cash on Delivery",
      description: "Available on eligible orders.",
    },
    thirdItem,
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "7-day return policy.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-secondary/40 p-5 sm:grid-cols-2">
      {deliveryItems.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gold">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="font-body text-sm font-semibold text-primary">
              {title}
            </span>
            <span className="font-body text-xs text-muted">{description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
