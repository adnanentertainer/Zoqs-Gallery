import { sendWhatsAppTemplateMessage } from "@/lib/whatsapp/whatsappClient";
import { formatPrice, toWhatsAppPhoneNumber } from "@/lib/utils";
import type { Order } from "@/types/order";

/**
 * Payload the "Confirm Order" quick-reply button echoes back on the inbound
 * webhook (src/app/api/whatsapp/webhook/route.ts). WhatsApp Manager's
 * template editor has no field for a custom quick-reply payload -- it always
 * echoes back the button's own label text -- so this must match the button
 * text configured on the template exactly (case-sensitive).
 */
export const CONFIRM_ORDER_BUTTON_PAYLOAD = "Confirm Order";

/**
 * Sends the customer-facing COD order confirmation request over WhatsApp --
 * this is what replaced the admin's manual wa.me deep link. Requires an
 * approved WhatsApp message template (env WHATSAPP_ORDER_CONFIRMATION_TEMPLATE_NAME,
 * default "order_confirmation_cod") submitted in Meta Business Manager with:
 *
 *   Category: Utility
 *   Header (text):  Order Confirmation  (WhatsApp Manager's header field
 *     silently drops emoji with variation selectors, e.g. 🛍️ -- plain text
 *     only)
 *   Body:
 *     Hi {{1}} 👋
 *
 *     This is *ZOQ's Gallery* confirming your Cash on Delivery order.
 *
 *     🧾 Order ID: *{{2}}*
 *     💰 Amount: *{{3}}*
 *
 *     Please tap *Confirm Order* below to proceed, or reply here if you'd
 *     like to cancel.
 *   Footer:  ZOQ's Gallery
 *   Buttons:  Quick Reply -> "Confirm Order" (button text field rejects
 *     emoji too). WhatsApp Manager's UI has no field for a custom payload --
 *     it always echoes back the button's own label text as the payload -- so
 *     CONFIRM_ORDER_BUTTON_PAYLOAD (above) must equal this text exactly.
 *
 * Never throws -- a failed send must never block checkout or an admin's
 * resend click; callers just see the order stay unconfirmed and can retry.
 */
export async function sendOrderConfirmationRequestWhatsApp(
  order: Order,
): Promise<{ error?: string }> {
  try {
    await sendWhatsAppTemplateMessage({
      to: toWhatsAppPhoneNumber(order.shippingAddress.phone),
      templateName:
        process.env.WHATSAPP_ORDER_CONFIRMATION_TEMPLATE_NAME ||
        "order_confirmation_cod",
      bodyParams: [
        order.shippingAddress.fullName,
        order.orderNumber,
        formatPrice(order.total),
      ],
    });
    return {};
  } catch (error) {
    console.error(
      "[whatsapp.sendOrderConfirmationRequestWhatsApp] failed:",
      error,
    );
    return {
      error: "Unable to send the WhatsApp confirmation request right now.",
    };
  }
}
