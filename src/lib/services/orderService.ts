import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapOrderRow } from "@/lib/supabase/mappers";
import type { CheckoutCartLine, Order, PaymentMethod } from "@/types/order";
import type { Database } from "@/types/supabase";

type ShippingPayload =
  Database["public"]["Functions"]["create_order"]["Args"]["p_shipping"];

export interface CreateOrderInput {
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

export interface CreateOrderResult {
  orderNumber: string;
}

/**
 * Calls the create_order() database function (see the Phase 9 migration) —
 * this is the ONLY path that ever writes to orders/order_items. The RPC
 * itself re-validates and re-prices everything server-side; this function
 * never sends a price, total, or shipping cost, only product identifiers and
 * quantities, matching the "never trust the client" requirement.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const supabase = await getSupabaseServerClient();

  const shippingPayload: ShippingPayload = {
    full_name: input.shipping.fullName,
    email: input.shipping.email,
    phone: input.shipping.phone,
    address_line_1: input.shipping.addressLine1,
    address_line_2: input.shipping.addressLine2,
    city: input.shipping.city,
    province: input.shipping.province,
    postal_code: input.shipping.postalCode,
    country: input.shipping.country,
  };

  const { data, error } = await supabase.rpc("create_order", {
    p_items: input.items.map((item) => ({
      product_slug: item.productSlug,
      quantity: item.quantity,
      selected_variants: item.selectedVariants ?? null,
    })),
    p_payment_method: input.paymentMethod,
    p_shipping: shippingPayload,
    p_customer_notes: input.customerNotes || null,
  });

  if (error) {
    console.error("[orderService.createOrder] RPC failed:", error);
    throw new Error(
      error.message.includes("no longer available") ||
        error.message.includes("Insufficient stock") ||
        error.message.includes("incomplete") ||
        error.message.includes("Cart is empty")
        ? error.message
        : "We couldn't place your order right now. Please try again.",
    );
  }

  return { orderNumber: data.order_number };
}

/**
 * Relies entirely on RLS ("Users can read own orders") rather than an
 * explicit user_id filter: a mismatched or nonexistent order number both
 * resolve to zero rows, so this can't be used to probe whether another
 * customer's order exists (see Phase 9 spec step 26).
 */
export async function getOrderByOrderNumber(
  orderNumber: string,
): Promise<Order | null> {
  const supabase = await getSupabaseServerClient();

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderError) {
    console.error(
      "[orderService.getOrderByOrderNumber] Supabase query failed:",
      orderError,
    );
    throw new Error("Unable to load this order right now.");
  }
  if (!orderRow) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderRow.id);

  if (itemsError) {
    console.error(
      "[orderService.getOrderByOrderNumber] Supabase query failed:",
      itemsError,
    );
    throw new Error("Unable to load this order right now.");
  }

  return mapOrderRow(orderRow, itemRows ?? []);
}
