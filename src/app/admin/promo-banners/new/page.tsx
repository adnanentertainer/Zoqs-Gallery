import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { PromoBannerForm } from "@/components/admin/PromoBannerForm";
import { listActivePromoCodesForSelect } from "@/lib/services/admin/adminPromoCodeService";

export const metadata: Metadata = {
  title: "New Promo Banner | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function NewPromoBannerPage() {
  const promoCodeOptions = await listActivePromoCodesForSelect();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New Promo Banner"
        description="Create a promotional banner for the homepage."
      />
      <PromoBannerForm mode="create" promoCodeOptions={promoCodeOptions} />
    </div>
  );
}
