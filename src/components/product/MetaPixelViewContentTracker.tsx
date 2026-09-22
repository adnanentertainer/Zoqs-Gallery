"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/metaPixel";

// Renders nothing — just fires the Meta Pixel ViewContent event once per
// product page load, mirroring RecentlyViewedTracker's pattern.
export function MetaPixelViewContentTracker({
  productId,
  productName,
  price,
  currency,
}: {
  productId: string;
  productName: string;
  price: number;
  currency: string;
}) {
  useEffect(() => {
    trackViewContent({ contentId: productId, contentName: productName, value: price, currency });
  }, [productId, productName, price, currency]);

  return null;
}
