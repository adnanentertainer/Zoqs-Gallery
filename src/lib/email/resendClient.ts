import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazily constructed so a missing RESEND_API_KEY doesn't crash the app at
 * import time — every caller is expected to treat email sending as
 * best-effort and catch its own errors (see orderNotification.ts).
 */
export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    client = new Resend(apiKey);
  }
  return client;
}
