"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  addSocialCampaignContent,
  createSocialCampaign,
  deleteSocialCampaign,
  deleteSocialCampaignContent,
  reviewSocialCampaignSubmission,
  setSocialCampaignContentActive,
  setSocialCampaignStatus,
  updateSocialCampaign,
} from "@/lib/services/admin/adminSocialCampaignService";
import { sendCampaignRewardEmail } from "@/lib/email/campaignReward";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";
import type {
  AdminSocialCampaignContentInput,
  AdminSocialCampaignInput,
} from "@/types/socialCampaign";

const DISABLED_ERROR = "This feature is currently disabled.";

function validateSocialCampaignInput(
  input: AdminSocialCampaignInput,
): string | undefined {
  if (input.name.trim().length === 0) return "Campaign name is required.";
  if (
    !Number.isInteger(input.requiredEngagementCount) ||
    input.requiredEngagementCount <= 0
  ) {
    return "Required engagement count must be a positive whole number.";
  }
  if (!Number.isInteger(input.discountValue) || input.discountValue <= 0) {
    return "Discount value must be a positive whole number.";
  }
  if (input.discountType === "percentage" && input.discountValue > 100) {
    return "A percentage discount can't exceed 100%.";
  }
  if (input.minOrderAmount !== null && input.minOrderAmount < 0) {
    return "Minimum order amount can't be negative.";
  }
  if (input.maxDiscountAmount !== null && input.maxDiscountAmount < 0) {
    return "Maximum discount amount can't be negative.";
  }
  if (
    !Number.isInteger(input.couponValidityDays) ||
    input.couponValidityDays <= 0
  ) {
    return "Coupon validity must be a positive whole number of days.";
  }
  if (input.maxTotalClaims !== null && input.maxTotalClaims <= 0) {
    return "Maximum total claims must be a positive whole number.";
  }
  if (
    !Number.isInteger(input.maxClaimsPerCustomer) ||
    input.maxClaimsPerCustomer <= 0
  ) {
    return "Maximum claims per customer must be a positive whole number.";
  }
  if (
    input.startsAt &&
    input.endsAt &&
    new Date(input.startsAt).getTime() > new Date(input.endsAt).getTime()
  ) {
    return "Start date must be before the end date.";
  }
  return undefined;
}

export async function createSocialCampaignAction(
  input: AdminSocialCampaignInput,
): Promise<{ id?: string; error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const validationError = validateSocialCampaignInput(input);
  if (validationError) return { error: validationError };
  const result = await createSocialCampaign(input);
  if (!result.error) revalidatePath("/admin/social-campaigns");
  return result;
}

export async function updateSocialCampaignAction(
  id: string,
  input: AdminSocialCampaignInput,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const validationError = validateSocialCampaignInput(input);
  if (validationError) return { error: validationError };
  const result = await updateSocialCampaign(id, input);
  if (!result.error) {
    revalidatePath("/admin/social-campaigns");
    revalidatePath(`/admin/social-campaigns/${id}`);
  }
  return result;
}

export async function setSocialCampaignStatusAction(
  id: string,
  status: AdminSocialCampaignInput["status"],
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const result = await setSocialCampaignStatus(id, status);
  if (!result.error) {
    revalidatePath("/admin/social-campaigns");
    revalidatePath(`/admin/social-campaigns/${id}`);
  }
  return result;
}

export async function deleteSocialCampaignAction(
  id: string,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const result = await deleteSocialCampaign(id);
  if (!result.error) revalidatePath("/admin/social-campaigns");
  return result;
}

function validateContentInput(
  input: AdminSocialCampaignContentInput,
): string | undefined {
  if (input.postUrl.trim().length === 0) return "Post URL is required.";
  try {
    new URL(input.postUrl.trim());
  } catch {
    return "Enter a valid post URL.";
  }
  return undefined;
}

export async function addSocialCampaignContentAction(
  campaignId: string,
  input: AdminSocialCampaignContentInput,
): Promise<{ id?: string; error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const validationError = validateContentInput(input);
  if (validationError) return { error: validationError };
  const result = await addSocialCampaignContent(campaignId, input);
  if (!result.error) revalidatePath(`/admin/social-campaigns/${campaignId}`);
  return result;
}

export async function setSocialCampaignContentActiveAction(
  campaignId: string,
  contentId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const result = await setSocialCampaignContentActive(contentId, isActive);
  if (!result.error) revalidatePath(`/admin/social-campaigns/${campaignId}`);
  return result;
}

export async function deleteSocialCampaignContentAction(
  campaignId: string,
  contentId: string,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const result = await deleteSocialCampaignContent(contentId);
  if (!result.error) revalidatePath(`/admin/social-campaigns/${campaignId}`);
  return result;
}

export async function reviewSocialCampaignSubmissionAction(
  campaignId: string,
  submissionId: string,
  decision: "approve" | "reject" | "request_more_proof",
  adminNotes: string,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  await requireAdmin();
  const result = await reviewSocialCampaignSubmission(
    submissionId,
    decision,
    adminNotes,
  );
  if (result.error) return { error: result.error };

  revalidatePath(`/admin/social-campaigns/${campaignId}`);
  revalidatePath("/account/rewards");

  // Best-effort reward notification — the approval already committed inside
  // the RPC above, so an email failure here must never surface as an error
  // to the admin. Follows the exact fire-and-forget-but-caught pattern used
  // for order notifications in src/app/checkout/actions.ts. WhatsApp is
  // intentionally not wired here yet: it requires a pre-approved Meta
  // message template, and none exists for this notification today.
  if (
    result.decision === "approved" &&
    result.code &&
    result.customerEmail &&
    result.discountType &&
    result.discountValue !== undefined &&
    result.expiresAt
  ) {
    try {
      await sendCampaignRewardEmail({
        toEmail: result.customerEmail,
        customerName: result.customerName ?? null,
        campaignName: result.campaignName ?? "Zoqs Gallery Social Campaign",
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        expiresAt: result.expiresAt,
      });
    } catch (notificationError) {
      console.error(
        "[social-campaigns.reviewSocialCampaignSubmissionAction] reward email failed:",
        notificationError,
      );
    }
  }

  return {};
}
