import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CustomerCampaignView,
  CustomerRewardCode,
  SocialCampaign,
  SocialCampaignContent,
  SocialCampaignParticipation,
  SocialCampaignSubmission,
} from "@/types/socialCampaign";
import type { Database } from "@/types/supabase";

type CampaignRow = Database["public"]["Tables"]["social_campaigns"]["Row"];
type ContentRow = Database["public"]["Tables"]["social_campaign_content"]["Row"];
type ParticipationRow =
  Database["public"]["Tables"]["social_campaign_participations"]["Row"];
type SubmissionRow =
  Database["public"]["Tables"]["social_campaign_submissions"]["Row"];
type PromoCodeRow = Database["public"]["Tables"]["promo_codes"]["Row"];

function toCampaign(row: CampaignRow): SocialCampaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    facebookPageId: row.facebook_page_id,
    instagramAccountId: row.instagram_account_id,
    engagementType: row.engagement_type as SocialCampaign["engagementType"],
    requiredEngagementCount: row.required_engagement_count,
    discountType: row.discount_type as SocialCampaign["discountType"],
    discountValue: row.discount_value,
    minOrderAmount: row.min_order_amount,
    maxDiscountAmount: row.max_discount_amount,
    couponValidityDays: row.coupon_validity_days,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    maxTotalClaims: row.max_total_claims,
    maxClaimsPerCustomer: row.max_claims_per_customer,
    allowRepeatClaims: row.allow_repeat_claims,
    status: row.status as SocialCampaign["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toContent(row: ContentRow): SocialCampaignContent {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    platform: row.platform as SocialCampaignContent["platform"],
    postUrl: row.post_url,
    postId: row.post_id,
    thumbnailUrl: row.thumbnail_url,
    caption: row.caption,
    postedAt: row.posted_at,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function toParticipation(row: ParticipationRow): SocialCampaignParticipation {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    cycleNumber: row.cycle_number,
    status: row.status as SocialCampaignParticipation["status"],
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

function toSubmission(row: SubmissionRow): SocialCampaignSubmission {
  return {
    id: row.id,
    participationId: row.participation_id,
    proofLink: row.proof_link,
    proofNote: row.proof_note,
    status: row.status as SocialCampaignSubmission["status"],
    adminNotes: row.admin_notes,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

function toRewardCode(
  row: PromoCodeRow,
  campaignName: string,
): CustomerRewardCode {
  return {
    code: row.code,
    discountType: row.discount_type as CustomerRewardCode["discountType"],
    discountValue: row.discount_value,
    minOrderAmount: row.min_order_amount,
    maxDiscountAmount: row.max_discount_amount,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    usageCount: row.usage_count,
    usageLimit: row.usage_limit,
    campaignName,
  };
}

/**
 * Loads the single most-recently-activated campaign (if any) plus everything
 * the signed-in customer needs to see their own progress against it — the
 * eligible posts, which ones they've already marked as engaged-with, their
 * live engagement count, their latest submission, and their reward code once
 * issued. Every count here is read straight from the source tables, never
 * from anything the client claims; the RPCs in this file are the only way
 * any of this state ever changes.
 */
export async function getActiveCampaignForCustomer(
  userId: string,
): Promise<CustomerCampaignView | null> {
  const supabase = await getSupabaseServerClient();

  const { data: campaignRow, error: campaignError } = await supabase
    .from("social_campaigns")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (campaignError) {
    console.error(
      "[socialCampaignService.getActiveCampaignForCustomer] campaign query failed:",
      campaignError,
    );
    throw new Error("Unable to load the current campaign right now.");
  }
  if (!campaignRow) return null;

  const campaign = toCampaign(campaignRow);

  const { data: contentRows, error: contentError } = await supabase
    .from("social_campaign_content")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("is_active", true)
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (contentError) {
    console.error(
      "[socialCampaignService.getActiveCampaignForCustomer] content query failed:",
      contentError,
    );
    throw new Error("Unable to load this campaign's posts right now.");
  }

  const { data: participationRow, error: participationError } = await supabase
    .from("social_campaign_participations")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("user_id", userId)
    .order("cycle_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (participationError) {
    console.error(
      "[socialCampaignService.getActiveCampaignForCustomer] participation query failed:",
      participationError,
    );
    throw new Error("Unable to load your campaign progress right now.");
  }

  const participation = participationRow
    ? toParticipation(participationRow)
    : null;

  const engagedContentIds: Record<"like" | "share", string[]> = {
    like: [],
    share: [],
  };
  let engagementCount = 0;
  let latestSubmission: SocialCampaignSubmission | null = null;
  let rewardCode: CustomerRewardCode | null = null;

  if (participation) {
    const { data: engagementRows, error: engagementError } = await supabase
      .from("social_campaign_engagements")
      .select("content_id, engagement_type")
      .eq("participation_id", participation.id);

    if (engagementError) {
      console.error(
        "[socialCampaignService.getActiveCampaignForCustomer] engagement query failed:",
        engagementError,
      );
      throw new Error("Unable to load your campaign progress right now.");
    }

    const distinctContentIds = new Set<string>();
    for (const row of engagementRows ?? []) {
      distinctContentIds.add(row.content_id);
      if (row.engagement_type === "like" || row.engagement_type === "share") {
        engagedContentIds[row.engagement_type].push(row.content_id);
      }
    }
    engagementCount = distinctContentIds.size;

    const { data: submissionRows, error: submissionError } = await supabase
      .from("social_campaign_submissions")
      .select("*")
      .eq("participation_id", participation.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (submissionError) {
      console.error(
        "[socialCampaignService.getActiveCampaignForCustomer] submission query failed:",
        submissionError,
      );
      throw new Error("Unable to load your campaign progress right now.");
    }
    latestSubmission = submissionRows?.[0] ? toSubmission(submissionRows[0]) : null;

    if (
      participation.status === "reward_issued" ||
      participation.status === "reward_used"
    ) {
      const { data: promoRow, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("participation_id", participation.id)
        .maybeSingle();

      if (promoError) {
        console.error(
          "[socialCampaignService.getActiveCampaignForCustomer] promo query failed:",
          promoError,
        );
      } else if (promoRow) {
        rewardCode = toRewardCode(promoRow, campaign.name);
      }
    }
  }

  return {
    campaign,
    content: (contentRows ?? []).map(toContent),
    participation,
    engagedContentIds,
    engagementCount,
    latestSubmission,
    rewardCode,
  };
}

/** Wraps start_campaign_participation() — idempotent, safe to call again for
 * a customer who already has a live entry (see the RPC for details). */
export async function joinCampaign(
  campaignId: string,
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("start_campaign_participation", {
    p_campaign_id: campaignId,
  });
  if (error) {
    console.error("[socialCampaignService.joinCampaign] RPC failed:", error);
    return { error: error.message };
  }
  return {};
}

/** Wraps toggle_campaign_engagement() — the RPC re-validates ownership,
 * editability, and that the post/engagement type are actually part of this
 * campaign, so nothing here needs to duplicate that logic. */
export async function toggleEngagement(
  participationId: string,
  contentId: string,
  engagementType: "like" | "share",
  markDone: boolean,
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("toggle_campaign_engagement", {
    p_participation_id: participationId,
    p_content_id: contentId,
    p_engagement_type: engagementType,
    p_mark_done: markDone,
  });
  if (error) {
    console.error(
      "[socialCampaignService.toggleEngagement] RPC failed:",
      error,
    );
    return { error: error.message };
  }
  return {};
}

/** Wraps submit_campaign_proof() — the RPC recomputes the real engagement
 * count from social_campaign_engagements itself before accepting this. */
export async function submitProof(
  participationId: string,
  proofLink: string,
  proofNote: string,
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("submit_campaign_proof", {
    p_participation_id: participationId,
    p_proof_link: proofLink || null,
    p_proof_note: proofNote || null,
  });
  if (error) {
    console.error("[socialCampaignService.submitProof] RPC failed:", error);
    return { error: error.message };
  }
  return {};
}
