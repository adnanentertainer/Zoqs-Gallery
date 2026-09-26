import { getResendClient } from "@/lib/email/resendClient";
import { escapeHtml } from "@/lib/email/orderNotification";
import { siteConfig } from "@/constants/site";
import { formatPrice } from "@/lib/utils";

export interface CampaignRewardEmailInput {
  toEmail: string;
  customerName: string | null;
  campaignName: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiresAt: string;
}

function discountLabel(type: "percentage" | "fixed", value: number): string {
  return type === "percentage" ? `${value}% OFF` : `${formatPrice(value)} OFF`;
}

function renderCampaignRewardEmailHtml(input: CampaignRewardEmailInput): string {
  const greetingName = input.customerName?.trim() || "there";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="margin-bottom:4px;">Congratulations, ${escapeHtml(greetingName)}!</h2>
      <p style="color:#666;margin-top:0;">
        You completed the <strong>${escapeHtml(input.campaignName)}</strong> social engagement campaign.
      </p>

      <div style="margin:24px 0;padding:20px;border:1px solid #eee;border-radius:4px;text-align:center;">
        <p style="margin:0 0 8px;color:#666;">Your reward</p>
        <p style="margin:0 0 12px;font-size:20px;font-weight:bold;">
          ${escapeHtml(discountLabel(input.discountType, input.discountValue))}
        </p>
        <p style="margin:0 0 4px;color:#666;">Your code</p>
        <p style="margin:0;font-size:22px;font-weight:bold;letter-spacing:2px;">${escapeHtml(input.code)}</p>
      </div>

      <p>
        Valid until <strong>${new Date(input.expiresAt).toLocaleDateString("en-PK")}</strong>.
        Use this code at checkout on your next order.
      </p>

      <p style="color:#666;margin-top:24px;">
        Questions? Just reply to this email or reach us on WhatsApp at ${escapeHtml(siteConfig.mobileWalletNumber)}.
      </p>
      <p style="margin-top:24px;">— ${escapeHtml(siteConfig.name)}</p>
    </div>
  `;
}

/**
 * Fire-and-forget notification sent when an admin approves a social
 * engagement campaign submission (see admin_review_campaign_submission() and
 * src/app/admin/social-campaigns/actions.ts). Deliberately swallows every
 * error itself, matching sendCustomerOrderConfirmationEmail — the reward code
 * is already committed to the database by the time this runs, so an email
 * failure must never undo or block that approval.
 */
export async function sendCampaignRewardEmail(
  input: CampaignRewardEmailInput,
): Promise<void> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: siteConfig.orderNotificationFromEmail,
      to: input.toEmail,
      subject: `You earned ${discountLabel(input.discountType, input.discountValue)} — ${siteConfig.name}`,
      html: renderCampaignRewardEmailHtml(input),
    });
    if (error) {
      console.error(
        "[campaignReward.sendCampaignRewardEmail] Resend error:",
        error,
      );
    }
  } catch (error) {
    console.error("[campaignReward.sendCampaignRewardEmail] failed:", error);
  }
}
