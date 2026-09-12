import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { formatPrice } from "@/lib/utils";
import { listAdminPurchases } from "@/lib/services/admin/purchaseService";
import { listSupplierOptions } from "@/lib/services/admin/supplierService";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import type { PurchaseStatus } from "@/types/admin";

export const metadata: Metadata = {
  title: "Purchases | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);

  const filters = {
    search: flat.search,
    supplierId: flat.supplier,
    status: parseEnumParam<PurchaseStatus>(flat.status, [
      "pending",
      "completed",
      "cancelled",
    ]),
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const [result, suppliers] = await Promise.all([
    listAdminPurchases(filters),
    listSupplierOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Purchases"
        description={`${result.totalCount} purchase${result.totalCount === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/purchases/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Purchase
          </Link>
        }
      />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-4"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Purchase number"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="supplier" className="font-body text-sm font-medium text-primary">
            Supplier
          </label>
          <select
            id="supplier"
            name="supplier"
            defaultValue={flat.supplier ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
          <Link href="/admin/purchases" className={buttonVariants("outline", "md")}>
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No purchases match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Purchase #</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-beige last:border-b-0">
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {purchase.purchaseNumber}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {purchase.supplierName}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {purchase.itemCount}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {formatPrice(purchase.totalAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={purchase.status} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={purchase.paymentStatus} />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(purchase.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/purchases/${purchase.id}`}
                        className="font-body text-sm font-medium text-gold hover:underline"
                      >
                        View
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
            basePath="/admin/purchases"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
