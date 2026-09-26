import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { SocialCampaignRowActions } from "@/components/admin/SocialCampaignRowActions";
import { listAdminSocialCampaigns } from "@/lib/services/admin/adminSocialCampaignService";
import { formatPrice } from "@/lib/utils";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "Social Campaigns | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

function discountLabel(discountType: string, discountValue: number): string {
  return discountType === "percentage"
    ? `${discountValue}%`
    : formatPrice(discountValue);
}

export default async function AdminSocialCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  if (!SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED) {
    notFound();
  }

  const flat = toFlatSearchParams(await searchParams);

  const filters = {
    search: flat.search,
    status: parseEnumParam<"draft" | "active" | "paused" | "expired">(
      flat.status,
      ["draft", "active", "paused", "expired"],
    ),
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const result = await listAdminSocialCampaigns(filters);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Social Campaigns"
        description={`${result.totalCount} campaign${result.totalCount === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/social-campaigns/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Campaign
          </Link>
        }
      />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-3"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Campaign name"
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="font-body text-sm font-medium text-primary"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={flat.status ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <Button type="submit" variant="primary" size="md">
            Apply Filters
          </Button>
          <Link
            href="/admin/social-campaigns"
            className={buttonVariants("outline", "md")}
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No campaigns match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Requirement</th>
                  <th className="px-5 py-3 font-medium">Reward</th>
                  <th className="px-5 py-3 font-medium">Participants</th>
                  <th className="px-5 py-3 font-medium">Claimed</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {campaign.name}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {campaign.requiredEngagementCount}{" "}
                      {campaign.engagementType === "both"
                        ? "likes/shares"
                        : `${campaign.engagementType}s`}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {discountLabel(campaign.discountType, campaign.discountValue)}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {campaign.participantCount}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {campaign.claimedCount}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <SocialCampaignRowActions
                        campaignId={campaign.id}
                        status={campaign.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/social-campaigns"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
