"use server";

import { getOrderForTracking } from "@/lib/services/orderService";
import type { Order } from "@/types/order";

export interface TrackOrderResult {
  order?: Order;
  error?: string;
}

/**
 * Server Action behind the Track Order form. The order number and contact
 * are only ever compared server-side inside get_order_for_tracking() — a
 * mismatched or nonexistent combination both resolve to a generic "not
 * found" message, so this can't be used to probe whether an order number or
 * a customer's email/phone exists.
 */
export async function trackOrder(
  orderNumberInput: string,
  contactInput: string,
): Promise<TrackOrderResult> {
  const orderNumber = orderNumberInput.trim();
  const contact = contactInput.trim();

  if (!orderNumber) {
    return { error: "Enter your order number." };
  }
  if (!contact) {
    return { error: "Enter the email or phone number used at checkout." };
  }

  try {
    const order = await getOrderForTracking(orderNumber, contact);
    if (!order) {
      return {
        error:
          "We couldn't find an order matching those details. Double-check your order number and the email or phone you used at checkout.",
      };
    }
    return { order };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
