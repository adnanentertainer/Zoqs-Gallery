import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getActiveCampaignForCustomer } from "@/lib/services/socialCampaignService";
import { CampaignEngagementChecklist } from "@/components/account/CampaignEngagementChecklist";
import { CampaignProofForm } from "@/components/account/CampaignProofForm";
import { formatPrice } from "@/lib/utils";
import type { SocialCampaignDiscountType } from "@/types/socialCampaign";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "Earn Your Discount | ZOQ's Gallery",
  description: "Complete social engagements to earn a discount on your next order.",
  robots: { index: false, follow: false },
};

function discountLabel(
  discountType: SocialCampaignDiscountType,
  discountValue: number,
): string {
  return discountType === "percentage"
    ? `${discountValue}% OFF`
    : `${formatPrice(discountValue)} OFF`;
}

// Statuses where a customer can no longer act on their current entry and
// joining again should start a fresh one, rather than resuming a dead-end.
const REJOINABLE_STATUSES = new Set(["rejected", "expired"]);

export default async function RewardsPage() {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) {
    notFound();
  }

  // Defense in depth alongside src/proxy.ts, matching src/app/account/page.tsx.
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirect=/account/rewards");
  }

  const view = await getActiveCampaignForCustomer(user.id);

  return (
    <Container className="flex flex-col gap-8 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Earn Your Discount" },
        ]}
      />

      <div>
        <Heading variant="h1" as="h1">
          Earn Your Discount
        </Heading>
        <Text variant="body" className="mt-2 text-muted">
          {view
            ? `Complete ${view.campaign.requiredEngagementCount} social engagements and get ${discountLabel(view.campaign.discountType, view.campaign.discountValue)} your next order.`
            : "There's no active campaign right now — check back soon."}
        </Text>
      </div>

      {view && (
        <>
          {view.rewardCode ? (
            <div className="flex flex-col gap-3 rounded-sm border border-gold bg-beige/40 p-6">
              <Text variant="body" className="font-medium text-primary">
                🎉 Congratulations! You completed the {view.campaign.name}{" "}
                campaign.
              </Text>
              <Text variant="body" className="text-primary">
                Your reward:{" "}
                <span className="font-semibold text-gold">
                  {discountLabel(
                    view.rewardCode.discountType,
                    view.rewardCode.discountValue,
                  )}
                </span>
              </Text>
              <div className="rounded-sm border border-beige bg-white px-4 py-3">
                <Text variant="bodySm" className="text-muted">
                  Your code
                </Text>
                <p className="select-all font-body text-xl font-bold tracking-widest text-primary">
                  {view.rewardCode.code}
                </p>
              </div>
              {view.rewardCode.expiresAt && (
                <Text variant="bodySm" className="text-muted">
                  Valid until{" "}
                  {new Date(view.rewardCode.expiresAt).toLocaleDateString(
                    "en-PK",
                  )}
                </Text>
              )}
              <div>
                <Badge
                  variant={
                    view.participation?.status === "reward_used"
                      ? "outline"
                      : "success"
                  }
                >
                  {view.participation?.status === "reward_used"
                    ? "Reward Used"
                    : "Reward Issued"}
                </Badge>
              </div>
            </div>
          ) : (
            <>
              {view.participation?.status === "rejected" && (
                <Text variant="bodySm" className="text-error">
                  Your last submission was rejected. You can join the campaign
                  again below.
                </Text>
              )}
              {view.participation?.status === "pending_verification" && (
                <Text variant="bodySm" className="text-gold">
                  You&apos;ve completed the checklist — this was automatically
                  submitted and is pending review by our team.
                </Text>
              )}

              <CampaignEngagementChecklist
                campaignId={view.campaign.id}
                participationId={
                  view.participation &&
                  !REJOINABLE_STATUSES.has(view.participation.status)
                    ? view.participation.id
                    : null
                }
                isEditable={view.participation?.status === "in_progress"}
                engagementType={view.campaign.engagementType}
                requiredCount={view.campaign.requiredEngagementCount}
                engagementCount={view.engagementCount}
                content={view.content}
                engagedContentIds={view.engagedContentIds}
              />

              {view.participation?.status === "more_proof_requested" && (
                <CampaignProofForm
                  participationId={view.participation.id}
                  adminNote={view.latestSubmission?.adminNotes}
                />
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}
