import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";

export const metadata: Metadata = {
  title: "New Promo Code | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function NewPromoCodePage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="New Promo Code"
        description="Create a discount code customers can apply at checkout."
      />
      <PromoCodeForm mode="create" />
    </div>
  );
}
