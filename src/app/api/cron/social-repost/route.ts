import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { processNextScheduledRepost } from "@/lib/services/admin/socialPostingService";

/**
 * Called on a schedule (see .github/workflows/social-repost-schedule.yml)
 * rather than by an admin session, so it authenticates with a shared secret
 * instead of requireAdmin() -- same reasoning as the WhatsApp webhook route.
 * Vercel's own free Cron Jobs can only fire once a day on the Hobby plan, so
 * an external scheduler (GitHub Actions, free) hits this a few times a day
 * instead; CRON_SECRET must match the GitHub Actions secret of the same
 * name.
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

export async function POST(request: NextRequest) {
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
