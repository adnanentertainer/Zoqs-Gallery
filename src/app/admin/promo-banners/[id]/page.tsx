import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { PromoBannerForm } from "@/components/admin/PromoBannerForm";
import { getAdminPromoBannerById } from "@/lib/services/admin/adminPromoBannerService";
import { listActivePromoCodesForSelect } from "@/lib/services/admin/adminPromoCodeService";

export const metadata: Metadata = {
  title: "Edit Promo Banner | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface AdminPromoBannerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPromoBannerDetailPage({
  params,
}: AdminPromoBannerDetailPageProps) {
  const { id } = await params;
  const [banner, promoCodeOptions] = await Promise.all([
    getAdminPromoBannerById(id),
    listActivePromoCodesForSelect(),
  ]);
  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`Edit ${banner.title}`}
        description="Update this promotional banner."
      />
      <PromoBannerForm
        mode="edit"
        bannerId={banner.id}
        initialValues={banner}
        promoCodeOptions={promoCodeOptions}
      />
    </div>
  );
}
