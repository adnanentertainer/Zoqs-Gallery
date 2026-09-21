// One-shot carry-through for a promo code attached to a homepage banner
// (see PromoBannerCarousel): clicking a banner's CTA stores its code here,
// and the checkout page consumes (reads + clears) it once on mount to
// pre-fill the promo field — never to auto-apply a discount. The customer
// still has to click "Apply" and see the discount before it affects their
// total, so this is purely a convenience, not a checkout-security surface.
const STORAGE_KEY = "zoqs-gallery-pending-promo";

export function setPendingPromoCode(code: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.) — the
    // code just won't carry through, which is a harmless UX-only fallback.
  }
}

export function consumePendingPromoCode(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value) window.localStorage.removeItem(STORAGE_KEY);
    return value;
  } catch {
    return null;
  }
}
