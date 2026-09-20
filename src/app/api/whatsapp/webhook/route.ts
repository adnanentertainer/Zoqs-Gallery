import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { toWhatsAppPhoneNumber } from "@/lib/utils";
import { CONFIRM_ORDER_BUTTON_PAYLOAD } from "@/lib/whatsapp/orderConfirmation";

/** How many recent, still-unconfirmed COD orders to scan when matching an
 * inbound reply's phone number to an order -- phone numbers aren't stored in
 * a normalized column, so the match happens in JS after a bounded fetch
 * rather than in SQL. */
const CANDIDATE_LIMIT = 50;

interface InboundMessage {
  from: string;
  type: string;
  text?: { body: string };
  button?: { text: string; payload: string };
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: InboundMessage[] };
    }>;
  }>;
}

/**
 * Meta's webhook verification handshake, run once when the callback URL is
 * registered in the App Dashboard -- confirms this endpoint controls
 * WHATSAPP_WEBHOOK_VERIFY_TOKEN before Meta starts sending real events to it.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

function isValidSignature(rawBody: string, header: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !header) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(header);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function isConfirmationReply(message: InboundMessage): boolean {
  if (message.type === "button") {
    return message.button?.payload === CONFIRM_ORDER_BUTTON_PAYLOAD;
  }
  if (message.type === "text") {
    return message.text?.body.trim().toLowerCase() === "yes";
  }
  return false;
}

/**
 * Marks the most recent still-unconfirmed COD order placed by this phone
 * number as WhatsApp-confirmed. Uses the service-role client because this
 * runs with no admin session for RLS to check -- the caller is Meta's
 * servers relaying a customer's reply, not an authenticated admin.
 */
async function confirmMostRecentOrderForPhone(fromPhone: string) {
  const supabase = getSupabaseServiceRoleClient();

  const { data: candidates, error } = await supabase
    .from("orders")
    .select("id, shipping_phone, created_at")
    .eq("payment_method", "cod")
    .is("whatsapp_confirmed_at", null)
    .order("created_at", { ascending: false })
    .limit(CANDIDATE_LIMIT);

  if (error) {
    console.error("[whatsapp.webhook] failed to load candidate orders:", error);
    return;
  }

  const match = candidates?.find(
    (order) => toWhatsAppPhoneNumber(order.shipping_phone) === fromPhone,
  );
  if (!match) return;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ whatsapp_confirmed_at: new Date().toISOString() })
    .eq("id", match.id);

  if (updateError) {
    console.error(
      "[whatsapp.webhook] failed to confirm order",
      match.id,
      updateError,
    );
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const messages =
      payload.entry?.flatMap(
        (entry) =>
          entry.changes?.flatMap((change) => change.value?.messages ?? []) ??
          [],
      ) ?? [];

    for (const message of messages) {
      if (isConfirmationReply(message)) {
        await confirmMostRecentOrderForPhone(message.from);
      }
    }
  } catch (error) {
    // Always still respond 200 below -- returning an error here would make
    // Meta retry-storm this webhook, and the failure is already logged.
    console.error("[whatsapp.webhook] failed to process payload:", error);
  }

  return new NextResponse("OK", { status: 200 });
}
