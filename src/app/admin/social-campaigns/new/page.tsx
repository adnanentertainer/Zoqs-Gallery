import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { SocialCampaignForm } from "@/components/admin/SocialCampaignForm";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "New Social Campaign | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function NewSocialCampaignPage() {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New Social Campaign"
        description="Reward customers with a discount for engaging with your social media posts."
      />
      <SocialCampaignForm mode="create" />
    </div>
  );
}
