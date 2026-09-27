import { formatPrice, toWhatsAppPhoneNumber } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import type { OrderStatus } from "@/types/order";

interface OrderInfoWhatsAppLinkInput {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  total: number;
  paymentMethodLabel: string;
  status: OrderStatus;
}

/**
 * The line naming what's happening to the order, keyed by its current
 * status -- everything else in the message (greeting, order number, total)
 * stays the same regardless of status.
 */
const STATUS_UPDATE_LINE: Record<OrderStatus, string> = {
  pending: "has been received and is awaiting confirmation",
  confirmed: "has been confirmed and we're getting it ready",
  processing: "is being packed and prepared for shipment",
  shipped: "has shipped and is on its way to you",
  delivered: "has been delivered — thank you for shopping with us",
  cancelled: "has been cancelled. Let us know if you have any questions",
};

/**
 * Plain wa.me deep link builder shared by the admin order detail page
 * (OrderWhatsAppButton) and the orders list row icon (OrderWhatsAppIconLink)
 * so the pre-filled message stays identical everywhere it's offered, and
 * always matches the order's current status. No Meta Cloud API involved --
 * just opens WhatsApp with text already typed in, for a human to review and
 * send.
 */
export function buildOrderInfoWhatsAppLink({
  customerName,
  customerPhone,
  orderNumber,
  total,
  paymentMethodLabel,
  status,
}: OrderInfoWhatsAppLinkInput): string {
  const message = `Hi ${customerName}! This is ${siteConfig.name}. Your order #${orderNumber} (${formatPrice(total)}, ${paymentMethodLabel}) ${STATUS_UPDATE_LINE[status]}.`;
  return `https://wa.me/${toWhatsAppPhoneNumber(customerPhone)}?text=${encodeURIComponent(message)}`;
}
