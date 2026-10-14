import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { processNextScheduledRepost } from "@/lib/services/admin/socialPostingService";

/**
 * Called by Vercel's own Cron Jobs (see the "crons" entry in vercel.json),
 * not by an admin session, so it authenticates with a shared secret instead
 * of requireAdmin() -- same reasoning as the WhatsApp webhook route. Vercel
 * automatically sends `Authorization: Bearer $CRON_SECRET` when it invokes a
 * configured cron job, as long as a CRON_SECRET environment variable is set
 * on the project -- no separate scheduler or secret needed.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(header);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await processNextScheduledRepost();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api.cron.social-repost] failed:", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// Vercel Cron Jobs invoke the configured path with GET; POST is kept too so
// this can still be triggered manually (e.g. a one-off curl) during testing.
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
