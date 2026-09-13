"use client";

import { useEffect } from "react";
import { recordProductView } from "@/lib/recentlyViewedStore";

// Renders nothing — just records that this product's slug was visited, so
// the RecentlyViewedSection on other product pages can show it later.
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordProductView(slug);
  }, [slug]);

  return null;
}
