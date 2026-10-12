"use client";

import { createContext, useContext, type ReactNode } from "react";

const PromoStatusContext = createContext<boolean>(false);

interface PromoStatusProviderProps {
  children: ReactNode;
  /** Server-computed via hasActivePromoCode() — see lib/services/promoCodeService.ts. */
  hasActivePromoCode: boolean;
}

export function PromoStatusProvider({
  children,
  hasActivePromoCode,
}: PromoStatusProviderProps) {
  return (
    <PromoStatusContext.Provider value={hasActivePromoCode}>
      {children}
    </PromoStatusContext.Provider>
  );
}

/**
 * True while at least one promo code is currently redeemable. Product price
 * displays use this to hide the originalPrice strike-through/"Sale" signal
 * while a campaign is running — otherwise a customer sees a product look
 * already discounted AND stack a promo code on top of it, which reads as
 * deceptive. The promo discount itself is still computed off the real
 * product.price, never off originalPrice.
 */
export function usePromoStatus(): boolean {
  return useContext(PromoStatusContext);
}
