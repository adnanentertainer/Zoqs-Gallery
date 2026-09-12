import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { SupplierForm } from "@/components/admin/SupplierForm";
import { getAdminSupplierById } from "@/lib/services/admin/supplierService";

export const metadata: Metadata = {
  title: "Edit Supplier | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const { id } = await params;
  const supplier = await getAdminSupplierById(id);
  if (!supplier) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit Supplier" description={supplier.name} />
      <SupplierForm
        mode="edit"
        supplierId={supplier.id}
        initialValues={supplier}
        products={supplier.products}
      />
    </div>
  );
}
