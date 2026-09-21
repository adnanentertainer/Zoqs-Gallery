import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { getAdminPromoCodeById } from "@/lib/services/admin/adminPromoCodeService";

export const metadata: Metadata = {
  title: "Edit Promo Code | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface AdminPromoCodeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPromoCodeDetailPage({
  params,
}: AdminPromoCodeDetailPageProps) {
  const { id } = await params;
  const promoCode = await getAdminPromoCodeById(id);
  if (!promoCode) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`Edit ${promoCode.code}`}
        description={`Used ${promoCode.usageCount} time${promoCode.usageCount === 1 ? "" : "s"} so far.`}
      />
      <PromoCodeForm
        mode="edit"
        promoCodeId={promoCode.id}
        initialValues={{
          code: promoCode.code,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          minOrderAmount: promoCode.minOrderAmount,
          maxDiscountAmount: promoCode.maxDiscountAmount,
          startsAt: promoCode.startsAt,
          expiresAt: promoCode.expiresAt,
          usageLimit: promoCode.usageLimit,
          usageLimitPerCustomer: promoCode.usageLimitPerCustomer,
          isActive: promoCode.isActive,
          description: promoCode.description,
        }}
      />
    </div>
  );
}
