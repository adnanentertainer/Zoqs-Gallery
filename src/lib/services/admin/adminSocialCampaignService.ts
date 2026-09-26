import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminSocialCampaignContentInput,
  AdminSocialCampaignDetail,
  AdminSocialCampaignInput,
  AdminSocialCampaignListItem,
  AdminSocialCampaignParticipationRow,
  SocialCampaign,
  SocialCampaignContent,
  SocialCampaignSubmission,
} from "@/types/socialCampaign";
import type { PaginationResult } from "@/types/admin";
import type { Database } from "@/types/supabase";

type CampaignRow = Database["public"]["Tables"]["social_campaigns"]["Row"];
type ContentRow = Database["public"]["Tables"]["social_campaign_content"]["Row"];
type SubmissionRow =
  Database["public"]["Tables"]["social_campaign_submissions"]["Row"];

export interface AdminSocialCampaignFilters {
  search?: string;
  status?: "draft" | "active" | "paused" | "expired";
  page: number;
  pageSize: number;
}

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

function toInputPayload(input: AdminSocialCampaignInput) {
  return {
    name: input.name.trim(),
    description: input.description.trim() || null,
    facebook_page_id: input.facebookPageId.trim() || null,
    instagram_account_id: input.instagramAccountId.trim() || null,
    engagement_type: input.engagementType,
    required_engagement_count: input.requiredEngagementCount,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_amount: input.minOrderAmount,
    max_discount_amount:
      input.discountType === "percentage" ? input.maxDiscountAmount : null,
    coupon_validity_days: input.couponValidityDays,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    max_total_claims: input.maxTotalClaims,
    max_claims_per_customer: input.maxClaimsPerCustomer,
    allow_repeat_claims: input.allowRepeatClaims,
    status: input.status,
  };
}

export async function listAdminSocialCampaigns(
  filters: AdminSocialCampaignFilters,
): Promise<PaginationResult<AdminSocialCampaignListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("social_campaigns")
    .select("*", { count: "exact" });

  if (filters.search?.trim()) {
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  query = query.order("created_at", { ascending: false });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error(
      "[adminSocialCampaignService.listAdminSocialCampaigns] failed:",
      error,
    );
    throw new Error("Unable to load campaigns right now.");
  }

  const rows = data ?? [];
  const campaignIds = rows.map((row) => row.id);

  // One extra query for the whole page rather than one per campaign — see
  // adminCustomerService's note on why per-row counts should never be N+1.
  const counts = new Map<string, { participantCount: number; claimedCount: number }>();
  if (campaignIds.length > 0) {
    const { data: participationRows, error: participationError } = await supabase
      .from("social_campaign_participations")
      .select("campaign_id, status")
      .in("campaign_id", campaignIds);

    if (participationError) {
      console.error(
        "[adminSocialCampaignService.listAdminSocialCampaigns] participation counts failed:",
        participationError,
      );
      throw new Error("Unable to load campaigns right now.");
    }

    for (const row of participationRows ?? []) {
      const entry = counts.get(row.campaign_id) ?? {
        participantCount: 0,
        claimedCount: 0,
      };
      entry.participantCount += 1;
      if (row.status === "reward_issued" || row.status === "reward_used") {
        entry.claimedCount += 1;
      }
      counts.set(row.campaign_id, entry);
    }
  }

  const totalCount = count ?? 0;
  return {
    items: rows.map((row) => {
      const campaign = toCampaign(row);
      const rowCounts = counts.get(row.id) ?? {
        participantCount: 0,
        claimedCount: 0,
      };
      return {
        id: campaign.id,
        name: campaign.name,
        engagementType: campaign.engagementType,
        requiredEngagementCount: campaign.requiredEngagementCount,
        discountType: campaign.discountType,
        discountValue: campaign.discountValue,
        status: campaign.status,
        startsAt: campaign.startsAt,
        endsAt: campaign.endsAt,
        participantCount: rowCounts.participantCount,
        claimedCount: rowCounts.claimedCount,
        createdAt: campaign.createdAt,
      };
    }),
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminSocialCampaignById(
  id: string,
): Promise<AdminSocialCampaignDetail | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: campaignRow, error: campaignError } = await supabase
    .from("social_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (campaignError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] failed:",
      campaignError,
    );
    throw new Error("Unable to load this campaign right now.");
  }
  if (!campaignRow) return null;

  const campaign = toCampaign(campaignRow);

  const { data: contentRows, error: contentError } = await supabase
    .from("social_campaign_content")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  if (contentError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] content failed:",
      contentError,
    );
    throw new Error("Unable to load this campaign's posts right now.");
  }

  const { data: participationRows, error: participationError } = await supabase
    .from("social_campaign_participations")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  if (participationError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] participations failed:",
      participationError,
    );
    throw new Error("Unable to load this campaign's participants right now.");
  }

  const participationIds = (participationRows ?? []).map((row) => row.id);
  const userIds = Array.from(
    new Set((participationRows ?? []).map((row) => row.user_id)),
  );

  const [{ data: engagementRows, error: engagementError }, { data: submissionRows, error: submissionError }, { data: profileRows, error: profileError }] =
    await Promise.all([
      participationIds.length > 0
        ? supabase
            .from("social_campaign_engagements")
            .select("participation_id, content_id")
            .in("participation_id", participationIds)
        : Promise.resolve({ data: [], error: null }),
      participationIds.length > 0
        ? supabase
            .from("social_campaign_submissions")
            .select("*")
            .in("participation_id", participationIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      userIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (engagementError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] engagements failed:",
      engagementError,
    );
    throw new Error("Unable to load this campaign's participants right now.");
  }
  if (submissionError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] submissions failed:",
      submissionError,
    );
    throw new Error("Unable to load this campaign's participants right now.");
  }
  if (profileError) {
    console.error(
      "[adminSocialCampaignService.getAdminSocialCampaignById] profiles failed:",
      profileError,
    );
    throw new Error("Unable to load this campaign's participants right now.");
  }

  const engagementCountByParticipation = new Map<string, Set<string>>();
  for (const row of engagementRows ?? []) {
    const set = engagementCountByParticipation.get(row.participation_id) ?? new Set<string>();
    set.add(row.content_id);
    engagementCountByParticipation.set(row.participation_id, set);
  }

  const latestSubmissionByParticipation = new Map<string, SocialCampaignSubmission>();
  for (const row of submissionRows ?? []) {
    if (!latestSubmissionByParticipation.has(row.participation_id)) {
      latestSubmissionByParticipation.set(row.participation_id, toSubmission(row));
    }
  }

  const profileById = new Map(
    (profileRows ?? []).map((row) => [row.id, row]),
  );

  const participations: AdminSocialCampaignParticipationRow[] = (
    participationRows ?? []
  ).map((row) => {
    const profile = profileById.get(row.user_id);
    return {
      id: row.id,
      customerName: profile?.full_name ?? null,
      customerEmail: profile?.email ?? null,
      cycleNumber: row.cycle_number,
      status: row.status as AdminSocialCampaignParticipationRow["status"],
      engagementCount: engagementCountByParticipation.get(row.id)?.size ?? 0,
      requiredEngagementCount: campaign.requiredEngagementCount,
      startedAt: row.started_at,
      submittedAt: row.submitted_at,
      latestSubmission: latestSubmissionByParticipation.get(row.id) ?? null,
    };
  });

  return {
    campaign,
    content: (contentRows ?? []).map(toContent),
    participations,
  };
}

export async function createSocialCampaign(
  input: AdminSocialCampaignInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("social_campaigns")
    .insert(toInputPayload(input))
    .select("id")
    .single();

  if (error) {
    console.error(
      "[adminSocialCampaignService.createSocialCampaign] failed:",
      error,
    );
    return { error: "Unable to create this campaign right now." };
  }
  return { id: data.id };
}

export async function updateSocialCampaign(
  id: string,
  input: AdminSocialCampaignInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("social_campaigns")
    .update(toInputPayload(input))
    .eq("id", id);

  if (error) {
    console.error(
      "[adminSocialCampaignService.updateSocialCampaign] failed:",
      error,
    );
    return { error: "Unable to update this campaign right now." };
  }
  return {};
}

export async function setSocialCampaignStatus(
  id: string,
  status: AdminSocialCampaignInput["status"],
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("social_campaigns")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(
      "[adminSocialCampaignService.setSocialCampaignStatus] failed:",
      error,
    );
    return { error: "Unable to update this campaign right now." };
  }
  return {};
}

export async function deleteSocialCampaign(
  id: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // Reward codes already issued from this campaign keep their own
  // campaign_id (ON DELETE SET NULL) and remain valid/redeemable — deleting
  // the campaign only stops new participants from joining it.
  const { error } = await supabase
    .from("social_campaigns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "[adminSocialCampaignService.deleteSocialCampaign] failed:",
      error,
    );
    return { error: "Unable to delete this campaign right now." };
  }
  return {};
}

function toContentPayload(
  campaignId: string,
  input: AdminSocialCampaignContentInput,
) {
  return {
    campaign_id: campaignId,
    platform: input.platform,
    post_url: input.postUrl.trim(),
    post_id: input.postId.trim() || null,
    thumbnail_url: input.thumbnailUrl.trim() || null,
    caption: input.caption.trim() || null,
    posted_at: input.postedAt,
    is_active: input.isActive,
  };
}

export async function addSocialCampaignContent(
  campaignId: string,
  input: AdminSocialCampaignContentInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("social_campaign_content")
    .insert(toContentPayload(campaignId, input))
    .select("id")
    .single();

  if (error) {
    console.error(
      "[adminSocialCampaignService.addSocialCampaignContent] failed:",
      error,
    );
    return { error: "Unable to add this post right now." };
  }
  return { id: data.id };
}

export async function setSocialCampaignContentActive(
  contentId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("social_campaign_content")
    .update({ is_active: isActive })
    .eq("id", contentId);

  if (error) {
    console.error(
      "[adminSocialCampaignService.setSocialCampaignContentActive] failed:",
      error,
    );
    return { error: "Unable to update this post right now." };
  }
  return {};
}

export async function deleteSocialCampaignContent(
  contentId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // Historical engagement rows reference this post — cascade-deleting them
  // would silently shrink a customer's already-counted progress, so removal
  // is a soft deactivate from the admin UI. This hard-delete path exists only
  // for a post added by mistake with zero engagements against it yet, and is
  // safe either way since ON DELETE CASCADE just removes any that exist.
  const { error } = await supabase
    .from("social_campaign_content")
    .delete()
    .eq("id", contentId);

  if (error) {
    console.error(
      "[adminSocialCampaignService.deleteSocialCampaignContent] failed:",
      error,
    );
    return { error: "Unable to remove this post right now." };
  }
  return {};
}

export interface ReviewSubmissionResult {
  error?: string;
  decision?: "approved" | "rejected" | "more_proof_requested";
  code?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  expiresAt?: string;
  customerEmail?: string;
  customerName?: string | null;
  campaignName?: string;
}

/**
 * Calls admin_review_campaign_submission() — the only place a reward code is
 * ever minted. Also resolves the customer's email/name so the caller (the
 * Server Action) can fire the reward-notification email without a second
 * round trip from the client.
 */
export async function reviewSocialCampaignSubmission(
  submissionId: string,
  decision: "approve" | "reject" | "request_more_proof",
  adminNotes: string,
): Promise<ReviewSubmissionResult> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data: submissionRow, error: submissionError } = await supabase
    .from("social_campaign_submissions")
    .select("participation_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submissionRow) {
    console.error(
      "[adminSocialCampaignService.reviewSocialCampaignSubmission] submission lookup failed:",
      submissionError,
    );
    return { error: "Unable to find this submission right now." };
  }

  const { data: participationRow, error: participationError } = await supabase
    .from("social_campaign_participations")
    .select("user_id, campaign_id")
    .eq("id", submissionRow.participation_id)
    .maybeSingle();

  if (participationError || !participationRow) {
    console.error(
      "[adminSocialCampaignService.reviewSocialCampaignSubmission] participation lookup failed:",
      participationError,
    );
    return { error: "Unable to find this campaign entry right now." };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "admin_review_campaign_submission",
    {
      p_submission_id: submissionId,
      p_decision: decision,
      p_admin_notes: adminNotes || null,
    },
  );

  if (rpcError) {
    console.error(
      "[adminSocialCampaignService.reviewSocialCampaignSubmission] RPC failed:",
      rpcError,
    );
    return { error: rpcError.message };
  }

  const result = rpcData as unknown as {
    decision: "approved" | "rejected" | "more_proof_requested";
    code?: string;
    discount_type?: "percentage" | "fixed";
    discount_value?: number;
    expires_at?: string;
  };

  if (result.decision !== "approved") {
    return { decision: result.decision };
  }

  const [{ data: profileRow }, { data: campaignRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", participationRow.user_id)
      .maybeSingle(),
    supabase
      .from("social_campaigns")
      .select("name")
      .eq("id", participationRow.campaign_id)
      .maybeSingle(),
  ]);

  return {
    decision: "approved",
    code: result.code,
    discountType: result.discount_type,
    discountValue: result.discount_value,
    expiresAt: result.expires_at,
    customerEmail: profileRow?.email ?? undefined,
    customerName: profileRow?.full_name ?? null,
    campaignName: campaignRow?.name,
  };
}
