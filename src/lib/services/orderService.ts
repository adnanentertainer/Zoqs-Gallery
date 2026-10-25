import { revalidateTag } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapOrderRow } from "@/lib/supabase/mappers";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { LOW_STOCK_THRESHOLD } from "@/lib/products";
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
  /** Re-validated and re-priced from scratch inside create_order() — never
   * trusted for the discount amount, only used to look up the code. */
  promoCode?: string;
}

export interface CreateOrderResult {
  orderNumber: string;
  /** Only set for a guest (unauthenticated) order — see getGuestOrderByOrderNumber. */
  guestToken: string | null;
  discountAmount: number;
  promoCode: string | null;
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
    p_promo_code: input.promoCode || null,
  });

  if (error) {
    console.error("[orderService.createOrder] RPC failed:", error);
    throw new Error(
      error.message.includes("no longer available") ||
        error.message.includes("Insufficient stock") ||
        error.message.includes("incomplete") ||
        error.message.includes("Cart is empty") ||
        // Every promo-related exception create_order() raises is already a
        // clear, customer-facing message (see the Promo Codes migration) —
        // never replaced by the generic fallback below.
        error.message.includes("promo code") ||
        error.message.includes("Minimum order")
        ? error.message
        : "We couldn't place your order right now. Please try again.",
    );
  }

  // create_order() decrements stock atomically in the database. We do NOT
  // force-revalidate the product cache on every order — that would bust the
  // shared "products" tag and regenerate every storefront page (home/shop/
  // category/every product), which is what blew through Vercel's ISR write
  // quota once already (see aeaa910). Ordinary stale stock numbers self-heal
  // within the service's revalidate window regardless, and checkout itself
  // is never affected by this cache — create_order always re-validates stock
  // server-side.
  //
  // The one case that can't wait out that window: a product actually running
  // low or selling out, where admin and the storefront showing different
  // availability is customer-facing (risk of someone buying something the
  // badge still calls "Limited Stock" when it's really gone). So only then —
  // checked with one cheap query against just the ordered slugs — do we pay
  // for the full-tag revalidation.
  try {
    const slugs = [...new Set(input.items.map((item) => item.productSlug))];
    const { data: stockRows } = await supabase
      .from("products")
      .select("stock, min_stock_level")
      .in("slug", slugs);
    const nowLowOrOutOfStock = stockRows?.some(
      (row) => row.stock <= (row.min_stock_level ?? LOW_STOCK_THRESHOLD),
    );
    if (nowLowOrOutOfStock) {
      revalidateTag(CACHE_TAGS.products, { expire: 0 });
    }
  } catch (revalidateError) {
    // Never let a cache-freshness nicety fail an already-placed order.
    console.error(
      "[orderService.createOrder] post-order stock revalidation check failed:",
      revalidateError,
    );
  }

  return {
    orderNumber: data.order_number,
    guestToken: data.guest_token,
    discountAmount: data.discount_amount,
    promoCode: data.promo_code,
  };
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

/**
 * For a guest (unauthenticated) order, which RLS otherwise hides from
 * everyone — even the guest who placed it — once user_id is null. Requires
 * the exact guest_token handed back from createOrder(), so this can't be
 * used to probe order numbers any more than the RLS-based lookup above can.
 */
export async function getGuestOrderByOrderNumber(
  orderNumber: string,
  guestToken: string,
): Promise<Order | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_guest_order", {
    p_order_number: orderNumber,
    p_guest_token: guestToken,
  });

  if (error) {
    console.error(
      "[orderService.getGuestOrderByOrderNumber] RPC failed:",
      error,
    );
    throw new Error("Unable to load this order right now.");
  }
  if (!data) return null;

  const result = data as unknown as {
    order: Parameters<typeof mapOrderRow>[0];
    items: Parameters<typeof mapOrderRow>[1];
  };
  return mapOrderRow(result.order, result.items);
}

/**
 * Public order-tracking lookup: requires the order number AND either the
 * email or phone number on the order, both verified server-side inside the
 * get_order_for_tracking() RPC (never trust a client-side match). Works for
 * guest and logged-in orders alike, unlike getGuestOrderByOrderNumber()
 * above, which only ever matches a guest_token.
 */
export async function getOrderForTracking(
  orderNumber: string,
  contact: string,
): Promise<Order | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_order_for_tracking", {
    p_order_number: orderNumber,
    p_contact: contact,
  });

  if (error) {
    console.error("[orderService.getOrderForTracking] RPC failed:", error);
    throw new Error("Unable to look up this order right now.");
  }
  if (!data) return null;

  const result = data as unknown as {
    order: Parameters<typeof mapOrderRow>[0];
    items: Parameters<typeof mapOrderRow>[1];
  };
  return mapOrderRow(result.order, result.items);
}
