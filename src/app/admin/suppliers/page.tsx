import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminSuppliers } from "@/lib/services/admin/supplierService";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import type { AdminSupplierStatus } from "@/types/admin";

export const metadata: Metadata = {
  title: "Suppliers | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);

  const filters = {
    search: flat.search,
    status: parseEnumParam<AdminSupplierStatus>(flat.status, [
      "active",
      "inactive",
    ]),
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const result = await listAdminSuppliers(filters);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Suppliers"
        description={`${result.totalCount} supplier${result.totalCount === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/suppliers/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Supplier
          </Link>
        }
      />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-3"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Name or contact person"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="font-body text-sm font-medium text-primary">
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
        <div className="flex items-end gap-3">
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
          <Link href="/admin/suppliers" className={buttonVariants("outline", "md")}>
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No suppliers match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Products</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-beige last:border-b-0">
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {supplier.name}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {supplier.contactPerson ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {supplier.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {supplier.email ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {supplier.productCount}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={supplier.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/suppliers/${supplier.id}`}
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
            basePath="/admin/suppliers"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
