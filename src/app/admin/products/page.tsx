import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminProducts } from "@/lib/services/admin/adminProductService";
import { listAdminCategories } from "@/lib/services/admin/adminCategoryService";
import { LOW_STOCK_THRESHOLD } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import type {
  AdminInventoryFilter,
  AdminProductSort,
  AdminProductStatus,
} from "@/types/admin";

const SORT_OPTIONS: { value: AdminProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function inventoryStatus(
  stock: number,
): "in-stock" | "low-stock" | "out-of-stock" {
  if (stock === 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const flat = toFlatSearchParams(rawParams);

  const filters = {
    search: flat.search,
    categoryId: flat.category,
    status: parseEnumParam<AdminProductStatus>(flat.status, [
      "active",
      "inactive",
    ]),
    inventory: parseEnumParam<AdminInventoryFilter>(flat.inventory, [
      "in-stock",
      "low-stock",
      "out-of-stock",
    ]),
    sort:
      parseEnumParam<AdminProductSort>(
        flat.sort,
        SORT_OPTIONS.map((option) => option.value),
      ) ?? "newest",
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const [result, categories] = await Promise.all([
    listAdminProducts(filters),
    listAdminCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Products"
        description={`${result.totalCount} product${result.totalCount === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/products/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
        }
      />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Name or slug"
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category"
            className="font-body text-sm font-medium text-primary"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={flat.category ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="font-body text-sm font-medium text-primary"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={flat.status ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="inventory"
            className="font-body text-sm font-medium text-primary"
          >
            Inventory
          </label>
          <select
            id="inventory"
            name="inventory"
            defaultValue={flat.inventory ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All inventory</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sort"
            className="font-body text-sm font-medium text-primary"
          >
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="primary" size="md">
            Apply Filters
          </Button>
          <Link
            href="/admin/products"
            className={buttonVariants("outline", "md")}
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No products match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-beige">
                          {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-body text-sm font-medium text-primary">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {product.categoryName}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={inventoryStatus(product.stock)} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={product.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(product.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
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

        <div className="px-5 pb-5">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/products"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
