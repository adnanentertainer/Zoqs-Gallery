import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { SupplierForm } from "@/components/admin/SupplierForm";

export const metadata: Metadata = {
  title: "New Supplier | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function NewSupplierPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Supplier"
        description="Create a new supplier."
      />
      <SupplierForm mode="create" />
    </div>
  );
}
