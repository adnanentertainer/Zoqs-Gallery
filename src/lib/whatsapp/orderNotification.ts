import { sendWhatsAppTemplateMessage } from "@/lib/whatsapp/whatsappClient";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

/**
 * Fire-and-forget admin notification for a newly placed order, sent
 * alongside the existing email notification. Deliberately swallows every
 * error itself -- a failed WhatsApp send must never fail checkout for the
 * customer, since the order is already committed by the time this runs.
 *
 * Requires an approved WhatsApp message template (WHATSAPP_TEMPLATE_NAME,
 * default "new_order_alert") with a body accepting 3 text parameters:
 * order number, total, and customer name -- see README for setup.
 */
export async function sendNewOrderNotificationWhatsApp(
  order: Order,
): Promise<void> {
  try {
    const to = process.env.WHATSAPP_ADMIN_NUMBER;
    if (!to) {
      console.error(
        "[whatsapp.sendNewOrderNotificationWhatsApp] WHATSAPP_ADMIN_NUMBER is not configured.",
      );
      return;
    }

    await sendWhatsAppTemplateMessage({
      to,
      templateName: process.env.WHATSAPP_TEMPLATE_NAME || "new_order_alert",
      bodyParams: [
        order.orderNumber,
        formatPrice(order.total),
        order.shippingAddress.fullName,
      ],
    });
  } catch (error) {
    console.error(
      "[whatsapp.sendNewOrderNotificationWhatsApp] failed:",
      error,
    );
  }
}
