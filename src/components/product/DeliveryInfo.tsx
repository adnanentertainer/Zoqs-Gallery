import { Banknote, Package, RotateCcw, Truck } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";

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
  {
    icon: Package,
    title: "Free Delivery",
    description: `On orders above ${formatPrice(siteConfig.freeShippingThreshold)}.`,
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy.",
  },
];

export function DeliveryInfo() {
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
