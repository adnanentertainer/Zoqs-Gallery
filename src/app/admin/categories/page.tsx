import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";
import {
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);
  const categories = await listAdminCategories(flat.search);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categor${categories.length === 1 ? "y" : "ies"} total`}
        action={
          <Link
            href="/admin/categories/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Category
          </Link>
        }
      />

      <form
        method="GET"
        className="flex gap-3 rounded-sm border border-beige bg-white p-4"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Category name"
          className="max-w-xs"
        />
        <Button type="submit" variant="primary" size="md" className="self-end">
          Search
        </Button>
        <Link
          href="/admin/categories"
          className={buttonVariants("outline", "md", "self-end")}
        >
          Reset
        </Link>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {categories.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No categories match this search.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Products</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-beige">
                          {category.imageUrl && (
                            <Image
                              src={category.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-body text-sm font-medium text-primary">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {category.productCount}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={category.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {category.displayOrder}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="font-body text-sm font-medium text-gold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
