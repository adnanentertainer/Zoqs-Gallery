import { WhatsAppIcon } from "@/components/icons/social-icons";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

// siteConfig.socialLinks.whatsapp is a public wa.me click-to-chat link
// (e.g. "https://wa.me/923316668233") -- reuse its number so the customer
// button always matches the number shown elsewhere on the site (footer, etc).
const whatsappNumber = siteConfig.socialLinks.whatsapp.replace(
  /^https:\/\/wa\.me\//,
  "",
);

interface ProductWhatsAppButtonProps {
  product: Product;
}

export function ProductWhatsAppButton({
  product,
}: ProductWhatsAppButtonProps) {
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const message = `Hi! I'm interested in *${product.name}* (${formatPrice(
    product.price,
  )}).\n${productUrl}`;
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ask about ${product.name} on WhatsApp`}
      className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full drop-shadow-[0_4px_16px_rgba(31,31,31,0.25)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:bottom-6 lg:right-6"
    >
      <WhatsAppIcon className="h-full w-full" aria-hidden="true" />
    </a>
  );
}
