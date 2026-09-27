import { WhatsAppIcon } from "@/components/icons/social-icons";
import { buildOrderInfoWhatsAppLink } from "@/lib/whatsapp/orderMessageLink";
import type { OrderStatus } from "@/types/order";

interface OrderWhatsAppIconLinkProps {
  orderNumber: string;
  total: number;
  paymentMethodLabel: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
}

/**
 * Compact icon-only version of OrderWhatsAppButton for the orders list
 * table row -- same wa.me link, same pre-filled message, just a quick way
 * to message the customer without opening the order detail page first.
 */
export function OrderWhatsAppIconLink({
  orderNumber,
  total,
  paymentMethodLabel,
  customerName,
  customerPhone,
  status,
}: OrderWhatsAppIconLinkProps) {
  const whatsAppHref = buildOrderInfoWhatsAppLink({
    customerName,
    customerPhone,
    orderNumber,
    total,
    paymentMethodLabel,
    status,
  });

  return (
    <a
      href={whatsAppHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message ${customerName} on WhatsApp about order ${orderNumber}`}
      title="Message on WhatsApp"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/10 transition-colors hover:bg-[#25D366]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
