// Thin wrapper around the Meta Pixel's global `fbq` (loaded in
// src/app/layout.tsx). Every call is a no-op until that script has run, so
// callers never need to guard for "pixel not loaded yet" themselves.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fire(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

export function trackViewContent(params: {
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
}) {
  fire("track", "ViewContent", {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: "product",
    value: params.value,
    currency: params.currency,
  });
}

export function trackAddToCart(params: {
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
  quantity: number;
}) {
  fire("track", "AddToCart", {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: "product",
    value: params.value,
    currency: params.currency,
    contents: [{ id: params.contentId, quantity: params.quantity }],
  });
}

export function trackInitiateCheckout(params: {
  contentIds: string[];
  value: number;
  currency: string;
  numItems: number;
}) {
  fire("track", "InitiateCheckout", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency,
    num_items: params.numItems,
  });
}

export function trackPurchase(params: {
  contentIds: string[];
  value: number;
  currency: string;
  orderId: string;
}) {
  fire("track", "Purchase", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency,
    order_id: params.orderId,
  });
}
