"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/product";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    lineItems,
    totalQuantity,
    subtotal,
    freeShipping,
  } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(isDrawerOpen, closeDrawer);
  useBodyScrollLock(isDrawerOpen);

  useEffect(() => {
    if (isDrawerOpen) closeButtonRef.current?.focus();
  }, [isDrawerOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        !isDrawerOpen && "pointer-events-none",
      )}
    >
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-primary/40 transition-opacity duration-300",
          isDrawerOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-beige px-6 py-5">
          <span className="font-heading text-lg font-semibold text-primary">
            Your Cart{totalQuantity > 0 && ` (${totalQuantity})`}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            tabIndex={isDrawerOpen ? 0 : -1}
            className="rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {lineItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <EmptyState
              title="Your cart is waiting"
              description="Discover pieces that complete your look."
              actionLabel="Continue Shopping"
              actionHref="/shop"
              onActionClick={closeDrawer}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {lineItems.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}
            </div>
            <div className="border-t border-beige px-6 py-5">
              <CartSummary
                subtotal={subtotal}
                freeShipping={freeShipping}
                secondaryAction={{ label: "View Cart", href: "/cart" }}
                onNavigate={closeDrawer}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
