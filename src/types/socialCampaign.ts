export type SocialCampaignEngagementType = "like" | "share" | "both";
export type SocialCampaignDiscountType = "percentage" | "fixed";
export type SocialCampaignStatus = "draft" | "active" | "paused" | "expired";
export type SocialCampaignPlatform = "facebook" | "instagram";

export type SocialCampaignParticipationStatus =
  | "in_progress"
  | "pending_verification"
  | "more_proof_requested"
  | "approved"
  | "rejected"
  | "reward_issued"
  | "reward_used"
  | "expired";

export type SocialCampaignSubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "more_proof_requested";

export interface SocialCampaign {
  id: string;
  name: string;
  description: string;
  facebookPageId: string | null;
  instagramAccountId: string | null;
  engagementType: SocialCampaignEngagementType;
  requiredEngagementCount: number;
  discountType: SocialCampaignDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  couponValidityDays: number;
  startsAt: string | null;
  endsAt: string | null;
  maxTotalClaims: number | null;
  maxClaimsPerCustomer: number;
  allowRepeatClaims: boolean;
  status: SocialCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape submitted from the admin create/edit form. */
export interface AdminSocialCampaignInput {
  name: string;
  description: string;
  facebookPageId: string;
  instagramAccountId: string;
  engagementType: SocialCampaignEngagementType;
  requiredEngagementCount: number;
  discountType: SocialCampaignDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  couponValidityDays: number;
  startsAt: string | null;
  endsAt: string | null;
  maxTotalClaims: number | null;
  maxClaimsPerCustomer: number;
  allowRepeatClaims: boolean;
  status: SocialCampaignStatus;
}

export interface AdminSocialCampaignListItem {
  id: string;
  name: string;
  engagementType: SocialCampaignEngagementType;
  requiredEngagementCount: number;
  discountType: SocialCampaignDiscountType;
  discountValue: number;
  status: SocialCampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  participantCount: number;
  claimedCount: number;
  createdAt: string;
}

export interface SocialCampaignContent {
  id: string;
  campaignId: string;
  platform: SocialCampaignPlatform;
  postUrl: string;
  postId: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  postedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSocialCampaignContentInput {
  platform: SocialCampaignPlatform;
  postUrl: string;
  postId: string;
  thumbnailUrl: string;
  caption: string;
  postedAt: string | null;
  isActive: boolean;
}

export interface SocialCampaignParticipation {
  id: string;
  campaignId: string;
  userId: string;
  cycleNumber: number;
  status: SocialCampaignParticipationStatus;
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface SocialCampaignSubmission {
  id: string;
  participationId: string;
  proofLink: string | null;
  proofNote: string | null;
  status: SocialCampaignSubmissionStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

/** One reward code issued to the signed-in customer, joined with its
 * originating campaign for display on the "Earn Your Discount" page. */
export interface CustomerRewardCode {
  code: string;
  discountType: SocialCampaignDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  expiresAt: string | null;
  isActive: boolean;
  usageCount: number;
  usageLimit: number | null;
  campaignName: string;
}

/** Everything the "Earn Your Discount" dashboard needs for one active
 * campaign and the signed-in customer's own progress against it. */
export interface CustomerCampaignView {
  campaign: SocialCampaign;
  content: SocialCampaignContent[];
  participation: SocialCampaignParticipation | null;
  /** Content IDs the customer has already marked engaged-with, keyed by
   * engagement type — recomputed server-side on every load, never trusted
   * from client state. */
  engagedContentIds: Record<"like" | "share", string[]>;
  engagementCount: number;
  latestSubmission: SocialCampaignSubmission | null;
  rewardCode: CustomerRewardCode | null;
}

/** Admin's view of one participation row, joined with the customer's name/
 * email and their latest submission for the review table. */
export interface AdminSocialCampaignParticipationRow {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  cycleNumber: number;
  status: SocialCampaignParticipationStatus;
  engagementCount: number;
  requiredEngagementCount: number;
  startedAt: string;
  submittedAt: string | null;
  latestSubmission: SocialCampaignSubmission | null;
}

export interface AdminSocialCampaignDetail {
  campaign: SocialCampaign;
  content: SocialCampaignContent[];
  participations: AdminSocialCampaignParticipationRow[];
}
