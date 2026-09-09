import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getAdminCategoryById } from "@/lib/services/admin/adminCategoryService";

export const metadata: Metadata = {
  title: "Edit Category | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Edit Category" description={category.name} />
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        initialValues={category}
      />
    </div>
  );
}
