"use client";

import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

/**
 * Shown on cart/checkout, where a customer who's hesitating has items
 * sitting in their cart but no product page's WhatsApp button in sight --
 * giving them a way to ask a question instead of silently abandoning.
 */
export function CartWhatsAppButton() {
  const { totalQuantity, subtotal } = useCart();
  const itemWord = totalQuantity === 1 ? "item" : "items";
  const message = `Hi! I have a question about my cart (${totalQuantity} ${itemWord}, ${formatPrice(subtotal)}).`;

  return (
    <WhatsAppFloatingButton
      message={message}
      ariaLabel="Ask a question about your cart on WhatsApp"
    />
  );
}
