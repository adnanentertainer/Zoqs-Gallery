"use server";

import { getServerUser } from "@/lib/auth/getServerUser";
import { createOrder, getOrderByOrderNumber } from "@/lib/services/orderService";
import { sendNewOrderNotificationEmail } from "@/lib/email/orderNotification";
import {
  validateAddressLine1,
  validateCity,
  validateCustomerNotes,
  validateEmail,
  validateFullName,
  validatePakistaniPhone,
  validatePostalCode,
  validateProvince,
} from "@/lib/checkout/validation";
import type { CheckoutCartLine, PaymentMethod } from "@/types/order";

export interface PlaceOrderInput {
  items: CheckoutCartLine[];
  paymentMethod: PaymentMethod;
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  customerNotes: string;
}

export interface PlaceOrderResult {
  orderNumber?: string;
  error?: string;
}

/**
 * Server Action behind the "Place Order" button — the trust boundary for
 * checkout. It re-validates every field the client already validated (never
 * trust client-side validation alone, per the Phase 9 spec) and passes only
 * product identifiers + quantities down to createOrder(), which in turn
 * calls the create_order() database function that does the actual pricing,
 * stock, and total calculation. No price, total, or shipping cost ever
 * travels from the client into this function.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const user = await getServerUser();
  if (!user) {
    return { error: "You must be signed in to place an order." };
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "Your cart is empty." };
  }
  for (const item of input.items) {
    if (
      typeof item.productSlug !== "string" ||
      item.productSlug.length === 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return { error: "Your cart contains an invalid item." };
    }
  }

  const validPaymentMethods: PaymentMethod[] = [
    "cod",
    "bank_transfer",
    "easypaisa",
    "jazzcash",
  ];
  if (!validPaymentMethods.includes(input.paymentMethod)) {
    return { error: "Select a payment method." };
  }

  const shippingErrors = [
    validateFullName(input.shipping.fullName),
    validateEmail(input.shipping.email),
    validatePakistaniPhone(input.shipping.phone),
    validateAddressLine1(input.shipping.addressLine1),
    validateCity(input.shipping.city),
    validateProvince(input.shipping.province),
    validatePostalCode(input.shipping.postalCode),
    validateCustomerNotes(input.customerNotes),
  ].filter(Boolean);

  if (shippingErrors.length > 0) {
    return { error: shippingErrors[0] };
  }

  try {
    const result = await createOrder({
      items: input.items,
      paymentMethod: input.paymentMethod,
      shipping: input.shipping,
      customerNotes: input.customerNotes,
    });

    // Best-effort admin notification, awaited (not fire-and-forget) so it
    // isn't cut off when the serverless function returns — but isolated in
    // its own try/catch, since the order is already committed at this point
    // and a notification failure must never surface as a checkout error.
    try {
      const order = await getOrderByOrderNumber(result.orderNumber);
      if (order) await sendNewOrderNotificationEmail(order);
    } catch (notificationError) {
      console.error(
        "[checkout.placeOrder] order notification failed:",
        notificationError,
      );
    }

    return { orderNumber: result.orderNumber };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "We couldn't place your order right now. Please try again.",
    };
  }
}
