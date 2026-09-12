import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";
import { listSupplierOptions } from "@/lib/services/admin/supplierService";

export const metadata: Metadata = {
  title: "New Product | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    listAdminCategories(),
    listSupplierOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Product"
        description="Create a new product."
      />
      <ProductForm mode="create" categories={categories} suppliers={suppliers} />
    </div>
  );
}
