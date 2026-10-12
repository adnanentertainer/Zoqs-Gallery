import crypto from "node:crypto";
import { META_PIXEL_ID } from "@/constants/meta";

const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Meta matches ph against digits-only, country-code-prefixed numbers (same
// normalization the browser pixel does in metaPixel.ts's
// setAdvancedMatchingUserData, kept in sync with it here).
function normalizePakistaniPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
}

interface PurchaseConversionEventInput {
  /** Must equal the eventID passed to the client-side fbq() Purchase call
   * for the same order (see MetaPixelPurchaseTracker) -- Meta deduplicates
   * on (event_name, event_id), so sending both never double-counts revenue. */
  eventId: string;
  orderId: string;
  value: number;
  currency: string;
  contentIds: string[];
  email?: string;
  phone?: string;
  eventSourceUrl: string;
}

/**
 * Sends the Purchase event server-side via Meta's Conversions API, alongside
 * (never instead of) the browser Pixel's client-side call. Browser-only
 * tracking silently loses a large share of Purchase events to iOS/Safari
 * tracking prevention and ad blockers -- which starves Ads Manager of the
 * one signal (actual revenue) it needs to optimize campaigns toward buyers
 * instead of window-shoppers who only click and add to cart.
 *
 * Never throws -- a failed send must never block checkout; callers just log
 * and move on, same pattern as sendOrderConfirmationRequestWhatsApp().
 */
export async function sendPurchaseConversionEvent({
  eventId,
  orderId,
  value,
  currency,
  contentIds,
  email,
  phone,
  eventSourceUrl,
}: PurchaseConversionEventInput): Promise<{ error?: string }> {
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
  if (!accessToken) {
    return { error: "META_CONVERSIONS_API_ACCESS_TOKEN is not configured." };
  }

  const userData: Record<string, string[]> = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(normalizePakistaniPhone(phone))];

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl,
              action_source: "website",
              user_data: userData,
              custom_data: {
                value,
                currency,
                content_ids: contentIds,
                content_type: "product",
                order_id: orderId,
              },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      return {
        error: `Meta Conversions API request failed (${response.status}): ${body}`,
      };
    }
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
