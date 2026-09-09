"use client";

import { useEffect } from "react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { EmptyState } from "@/components/product";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { lineItems, subtotal, freeShipping, totalQuantity } = useCart();

  useEffect(() => {
    document.title = "Your Cart | ZOQ's Gallery";
  }, []);

  return (
    <Container className="flex flex-col gap-6 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <Heading variant="h1" as="h1">
        Your Cart
      </Heading>

      {lineItems.length === 0 ? (
        <EmptyState
          title="Your cart is waiting"
          description="Discover pieces that complete your look."
          actionLabel="Continue Shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col rounded-sm border border-beige px-4 lg:col-span-2 lg:px-6">
            {lineItems.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </div>

          <div className="flex flex-col rounded-sm border border-beige p-6 lg:sticky lg:top-24">
            <Heading variant="h3" as="h2" className="mb-4">
              Order Summary
            </Heading>
            <Text variant="bodySm" className="mb-4 text-muted">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </Text>
            <CartSummary
              subtotal={subtotal}
              freeShipping={freeShipping}
              secondaryAction={{ label: "Continue Shopping", href: "/shop" }}
            />
          </div>
        </div>
      )}
    </Container>
  );
}
