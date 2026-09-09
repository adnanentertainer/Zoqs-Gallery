import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "New Category | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Category"
        description="Create a new category."
      />
      <CategoryForm mode="create" />
    </div>
  );
}
