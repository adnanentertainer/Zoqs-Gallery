import Link from "next/link";
import { RotateCcw, MessageCircle, Truck } from "lucide-react";
import { siteConfig } from "@/constants/site";

/**
 * Reassurance shown right next to the final decision point (Order Summary /
 * Place Order button) — these are all policies/contact points that already
 * exist elsewhere on the site (returns-and-refunds page, WhatsApp button,
 * COD delivery estimate in paymentMethods.ts); this just surfaces them at
 * checkout instead of making the customer go find them.
 */
export function CheckoutTrustBadges() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-beige p-6">
      <Link
        href="/returns-and-refunds"
        className="flex items-center gap-3 font-body text-sm text-primary hover:text-gold"
      >
        <RotateCcw className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        Easy returns &amp; refunds
      </Link>
      <a
        href={siteConfig.socialLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 font-body text-sm text-primary hover:text-gold"
      >
        <MessageCircle className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        Questions? Chat with us on WhatsApp
      </a>
      <span className="flex items-center gap-3 font-body text-sm text-primary">
        <Truck className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        Delivery in 3-5 business days
      </span>
    </div>
  );
}
