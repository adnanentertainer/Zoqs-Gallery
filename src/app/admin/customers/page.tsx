import Link from "next/link";
import { AdminPageHeader, Pagination } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminCustomers } from "@/lib/services/admin/adminCustomerService";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);
  const result = await listAdminCustomers({
    search: flat.search,
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Customers"
        description={`${result.totalCount} account${result.totalCount === 1 ? "" : "s"} total`}
      />

      <form
        method="GET"
        className="flex gap-3 rounded-sm border border-beige bg-white p-4"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Name, email, or phone"
          className="max-w-xs"
        />
        <Button type="submit" variant="primary" size="md" className="self-end">
          Search
        </Button>
        <Link
          href="/admin/customers"
          className={buttonVariants("outline", "md", "self-end")}
        >
          Reset
        </Link>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No customers match this search.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {customer.fullName ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {customer.email ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {customer.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={customer.role === "admin" ? "gold" : "default"}
                      >
                        {customer.role === "admin" ? "Admin" : "Customer"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(customer.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
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
            basePath="/admin/customers"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
