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

// Meta's pixel hashes em/ph client-side before sending -- callers must pass
// raw values here, never pre-hash them.
function setAdvancedMatchingUserData(user: { email?: string; phone?: string }) {
  const userData: Record<string, string> = {};
  if (user.email) userData.em = user.email.trim().toLowerCase();
  // Phone is required at checkout (unlike email), so this covers every
  // order -- normalized to country-code digits-only, the format Meta
  // matches best against (e.g. "03XXXXXXXXX" -> "923XXXXXXXXX").
  if (user.phone) {
    const digits = user.phone.replace(/\D/g, "");
    userData.ph = digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
  }
  if (Object.keys(userData).length > 0) {
    fire("set", "userData", userData);
  }
}

export function trackPurchase(params: {
  contentIds: string[];
  value: number;
  currency: string;
  orderId: string;
  email?: string;
  phone?: string;
}) {
  setAdvancedMatchingUserData({ email: params.email, phone: params.phone });
  fire("track", "Purchase", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency,
    order_id: params.orderId,
  });
}
