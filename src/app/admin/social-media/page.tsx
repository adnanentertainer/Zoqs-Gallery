import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin";
import { buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { SocialMediaSettingsForm } from "@/components/admin/SocialMediaSettingsForm";
import { getSocialMediaSettings } from "@/lib/services/admin/socialPostingService";

export const metadata: Metadata = {
  title: "Social Auto-Post | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSocialMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ tiktok?: string }>;
}) {
  const settings = await getSocialMediaSettings();
  const { tiktok } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Social Auto-Post"
        description="Automatically publish new/activated products to Facebook, Instagram, and TikTok."
        action={
          <Link
            href="/admin/social-media/history"
            className={buttonVariants("outline", "md")}
          >
            View History
          </Link>
        }
      />

      {tiktok === "connected" && (
        <AuthMessage variant="success" message="TikTok account connected." />
      )}
      {tiktok === "error" && (
        <AuthMessage
          variant="error"
          message="Could not connect TikTok — please try again."
        />
      )}

      <SocialMediaSettingsForm initialValues={settings} />
    </div>
  );
}
