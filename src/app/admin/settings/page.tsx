import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { Heading, Text } from "@/components/ui/Typography";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { FestivalBannerForm } from "@/components/admin/FestivalBannerForm";
import { getAdminStoreSettings } from "@/lib/services/admin/adminSettingsService";
import { getAdminFestivalBanner } from "@/lib/services/admin/adminFestivalBannerService";

export const metadata: Metadata = {
  title: "Settings | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const [settings, festivalBanner] = await Promise.all([
    getAdminStoreSettings(),
    getAdminFestivalBanner(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Store Settings"
        description="These settings control the public storefront."
      />
      <SettingsForm initialValues={settings} />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Festival Countdown Banner
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          Show a site-wide countdown banner for an upcoming sale — Eid,
          Basant, or any other festival.
        </Text>
      </div>
      <FestivalBannerForm initialValues={festivalBanner} />
    </div>
  );
}
