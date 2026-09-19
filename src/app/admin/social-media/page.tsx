import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin";
import { buttonVariants } from "@/components/ui/Button";
import { SocialMediaSettingsForm } from "@/components/admin/SocialMediaSettingsForm";
import { getSocialMediaSettings } from "@/lib/services/admin/socialPostingService";

export const metadata: Metadata = {
  title: "Social Auto-Post | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSocialMediaPage() {
  const settings = await getSocialMediaSettings();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Social Auto-Post"
        description="Automatically publish new/activated products to Facebook and Instagram."
        action={
          <Link
            href="/admin/social-media/history"
            className={buttonVariants("outline", "md")}
          >
            View History
          </Link>
        }
      />

      <SocialMediaSettingsForm initialValues={settings} />
    </div>
  );
}
