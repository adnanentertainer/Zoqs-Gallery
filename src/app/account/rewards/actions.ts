"use server";

import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/auth/getServerUser";
import {
  joinCampaign,
  submitProof,
  toggleEngagement,
} from "@/lib/services/socialCampaignService";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

const DISABLED_ERROR = "This feature is currently disabled.";

export async function joinCampaignAction(
  campaignId: string,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  const user = await getServerUser();
  if (!user) return { error: "You must be signed in to do this." };

  const result = await joinCampaign(campaignId);
  if (!result.error) revalidatePath("/account/rewards");
  return result;
}

export async function toggleEngagementAction(
  participationId: string,
  contentId: string,
  engagementType: "like" | "share",
  markDone: boolean,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  const user = await getServerUser();
  if (!user) return { error: "You must be signed in to do this." };

  const result = await toggleEngagement(
    participationId,
    contentId,
    engagementType,
    markDone,
  );
  if (!result.error) revalidatePath("/account/rewards");
  return result;
}

export async function submitProofAction(
  participationId: string,
  proofLink: string,
  proofNote: string,
): Promise<{ error?: string }> {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) return { error: DISABLED_ERROR };
  const user = await getServerUser();
  if (!user) return { error: "You must be signed in to do this." };

  if (!proofLink.trim() && !proofNote.trim()) {
    return {
      error: "Please share a post link or a short note so we can verify your engagement.",
    };
  }

  const result = await submitProof(participationId, proofLink, proofNote);
  if (!result.error) revalidatePath("/account/rewards");
  return result;
}
