"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/metaPixel";

// Renders nothing — fires the Meta Pixel Purchase event once per order.
// Guarded by localStorage (not a ref) because this page is commonly
// reloaded or revisited (e.g. from an order confirmation email link), and
// a duplicate Purchase event would inflate revenue/ROAS in Ads Manager.
export function MetaPixelPurchaseTracker({
  orderId,
  orderNumber,
  value,
  currency,
  contentIds,
}: {
  orderId: string;
  orderNumber: string;
  value: number;
  currency: string;
  contentIds: string[];
}) {
  useEffect(() => {
    const dedupeKey = `zoqs-gallery-purchase-tracked:${orderNumber}`;
    if (window.localStorage.getItem(dedupeKey)) return;
    trackPurchase({ orderId, value, currency, contentIds });
    window.localStorage.setItem(dedupeKey, "1");
  }, [orderId, orderNumber, value, currency, contentIds]);

  return null;
}
