import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { Heading, Text } from "@/components/ui/Typography";
import { SocialCampaignForm } from "@/components/admin/SocialCampaignForm";
import { SocialCampaignContentManager } from "@/components/admin/SocialCampaignContentManager";
import { SocialCampaignSubmissionsTable } from "@/components/admin/SocialCampaignSubmissionsTable";
import { getAdminSocialCampaignById } from "@/lib/services/admin/adminSocialCampaignService";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "Edit Social Campaign | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function EditSocialCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) {
    notFound();
  }

  const { id } = await params;
  const detail = await getAdminSocialCampaignById(id);
  if (!detail) notFound();

  const { campaign, content, participations } = detail;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={campaign.name}
        description="Manage this campaign's rules, eligible posts, and customer submissions."
      />

      <SocialCampaignForm
        mode="edit"
        campaignId={campaign.id}
        initialValues={{
          name: campaign.name,
          description: campaign.description,
          facebookPageId: campaign.facebookPageId ?? "",
          instagramAccountId: campaign.instagramAccountId ?? "",
          engagementType: campaign.engagementType,
          requiredEngagementCount: campaign.requiredEngagementCount,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          minOrderAmount: campaign.minOrderAmount,
          maxDiscountAmount: campaign.maxDiscountAmount,
          couponValidityDays: campaign.couponValidityDays,
          startsAt: campaign.startsAt,
          endsAt: campaign.endsAt,
          maxTotalClaims: campaign.maxTotalClaims,
          maxClaimsPerCustomer: campaign.maxClaimsPerCustomer,
          allowRepeatClaims: campaign.allowRepeatClaims,
          status: campaign.status,
        }}
      />

      <SocialCampaignContentManager campaignId={campaign.id} content={content} />

      <div className="flex flex-col gap-4">
        <div>
          <Heading variant="h3" as="h2">
            Customer Submissions
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            Review each customer&apos;s progress and proof, then approve to
            automatically issue their reward code.
          </Text>
        </div>
        <SocialCampaignSubmissionsTable
          campaignId={campaign.id}
          participations={participations}
        />
      </div>
    </div>
  );
}
