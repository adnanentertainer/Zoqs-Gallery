import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminStoreSettings } from "@/lib/services/admin/adminSettingsService";

export const metadata: Metadata = {
  title: "Settings | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getAdminStoreSettings();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Store Settings"
        description="These settings control the public storefront."
      />
      <SettingsForm initialValues={settings} />
    </div>
  );
}
