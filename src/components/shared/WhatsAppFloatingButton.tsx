import { WhatsAppIcon } from "@/components/icons/social-icons";
import { siteConfig } from "@/constants/site";

// siteConfig.socialLinks.whatsapp is a public wa.me click-to-chat link
// (e.g. "https://wa.me/923316668233") -- reuse its number so every WhatsApp
// entry point on the site always matches (footer, product page, etc).
const whatsappNumber = siteConfig.socialLinks.whatsapp.replace(
  /^https:\/\/wa\.me\//,
  "",
);

interface WhatsAppFloatingButtonProps {
  message: string;
  ariaLabel: string;
}

/**
 * Fixed-position WhatsApp chat entry point. Lives wherever a customer might
 * hesitate and want to ask a question before committing -- not just product
 * pages, since most cart/checkout abandonment happens with no way to ask
 * anything at all.
 */
export function WhatsAppFloatingButton({
  message,
  ariaLabel,
}: WhatsAppFloatingButtonProps) {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full drop-shadow-[0_4px_16px_rgba(31,31,31,0.25)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:bottom-6 lg:right-6"
    >
      <WhatsAppIcon className="h-full w-full" aria-hidden="true" />
    </a>
  );
}
