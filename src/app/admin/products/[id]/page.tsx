import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProductById } from "@/lib/services/admin/adminProductService";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";

export const metadata: Metadata = {
  title: "Edit Product | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    listAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit Product" description={product.name} />
      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={product}
        hasOrderHistory={product.hasOrderHistory}
        categories={categories}
      />
    </div>
  );
}
