import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { PromoCodeRowActions } from "@/components/admin/PromoCodeRowActions";
import { listAdminPromoCodes } from "@/lib/services/admin/adminPromoCodeService";
import { formatPrice } from "@/lib/utils";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";

export const metadata: Metadata = {
  title: "Promo Codes | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

function discountLabel(
  discountType: string,
  discountValue: number,
): string {
  return discountType === "percentage"
    ? `${discountValue}%`
    : formatPrice(discountValue);
}

export default async function AdminPromoCodesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);

  const filters = {
    search: flat.search,
    status: parseEnumParam<"active" | "inactive">(flat.status, [
      "active",
      "inactive",
    ]),
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const result = await listAdminPromoCodes(filters);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Promo Codes"
        description={`${result.totalCount} promo code${result.totalCount === 1 ? "" : "s"} total`}
        action={
          <Link
            href="/admin/promo-codes/new"
            className={buttonVariants("primary", "md")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Promo Code
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
          placeholder="Promo code"
        />
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
        <div className="flex items-end gap-3">
          <Button type="submit" variant="primary" size="md">
            Apply Filters
          </Button>
          <Link
            href="/admin/promo-codes"
            className={buttonVariants("outline", "md")}
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No promo codes match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Discount</th>
                  <th className="px-5 py-3 font-medium">Min. Order</th>
                  <th className="px-5 py-3 font-medium">Usage</th>
                  <th className="px-5 py-3 font-medium">Starts</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((promo) => (
                  <tr
                    key={promo.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {promo.code}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {discountLabel(promo.discountType, promo.discountValue)}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {promo.minOrderAmount ? formatPrice(promo.minOrderAmount) : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {promo.usageCount}
                      {promo.usageLimit ? ` / ${promo.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {promo.startsAt
                        ? new Date(promo.startsAt).toLocaleDateString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {promo.expiresAt
                        ? new Date(promo.expiresAt).toLocaleDateString("en-PK")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={promo.isActive ? "active" : "inactive"}
                      />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(promo.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <PromoCodeRowActions
                        promoCodeId={promo.id}
                        code={promo.code}
                        isActive={promo.isActive}
                      />
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
            basePath="/admin/promo-codes"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
