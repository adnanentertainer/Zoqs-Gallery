import { getResendClient } from "@/lib/email/resendClient";
import { escapeHtml } from "@/lib/email/orderNotification";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

function renderCustomerOrderEmailHtml(order: Order): string {
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.productName)}${item.variantName ? ` (${escapeHtml(item.variantName)})` : ""}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.lineTotal)}</td>
        </tr>`,
    )
    .join("");

  const address = order.shippingAddress;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="margin-bottom:4px;">Thank you for your order, ${escapeHtml(address.fullName)}!</h2>
      <p style="color:#666;margin-top:0;">
        Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been received and is being processed.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #222;padding:8px 0;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #222;padding:8px 0;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #222;padding:8px 0;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;margin-bottom:16px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatPrice(order.subtotal)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right;">${formatPrice(order.shippingCost)}</td></tr>
        <tr><td style="font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;">${formatPrice(order.total)}</td></tr>
      </table>

      <p><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod)}</p>

      <h3 style="margin-bottom:4px;">Delivery Address</h3>
      <p style="margin:0;">
        ${escapeHtml(address.fullName)}<br/>
        ${escapeHtml(address.phone)}<br/>
        ${escapeHtml(address.addressLine1)}${address.addressLine2 ? `, ${escapeHtml(address.addressLine2)}` : ""}<br/>
        ${escapeHtml(address.city)}, ${escapeHtml(address.province)} ${escapeHtml(address.postalCode)}<br/>
        ${escapeHtml(address.country)}
      </p>

      <p style="color:#666;margin-top:24px;">
        Questions about your order? Just reply to this email or reach us on WhatsApp at ${escapeHtml(siteConfig.mobileWalletNumber)}.
      </p>
      <p style="margin-top:24px;">— ${escapeHtml(siteConfig.name)}</p>
    </div>
  `;
}

/**
 * Fire-and-forget order confirmation sent to the customer's own email,
 * separate from the admin notification in orderNotification.ts.
 * Deliberately swallows every error itself -- a failed email must never
 * fail checkout for the customer, since the order is already committed by
 * the time this runs.
 */
export async function sendCustomerOrderConfirmationEmail(
  order: Order,
): Promise<void> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: siteConfig.orderNotificationFromEmail,
      to: order.shippingAddress.email,
      subject: `Your ${siteConfig.name} order ${order.orderNumber} is confirmed`,
      html: renderCustomerOrderEmailHtml(order),
    });
    if (error) {
      console.error(
        "[customerOrderConfirmation.sendCustomerOrderConfirmationEmail] Resend error:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[customerOrderConfirmation.sendCustomerOrderConfirmationEmail] failed:",
      error,
    );
  }
}
