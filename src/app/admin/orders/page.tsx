import Link from "next/link";
import { AdminPageHeader, Pagination, StatusBadge } from "@/components/admin";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { listAdminOrders } from "@/lib/services/admin/adminOrderService";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  parseEnumParam,
  parsePage,
  toFlatSearchParams,
  type RawSearchParams,
} from "@/lib/admin/searchParams";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];
const PAYMENT_METHOD_VALUES: PaymentMethod[] = [
  "cod",
  "bank_transfer",
  "easypaisa",
  "jazzcash",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const flat = toFlatSearchParams(await searchParams);

  const filters = {
    search: flat.search,
    status: parseEnumParam<OrderStatus>(flat.status, ORDER_STATUSES),
    paymentStatus: parseEnumParam<PaymentStatus>(
      flat.paymentStatus,
      PAYMENT_STATUSES,
    ),
    paymentMethod: parseEnumParam<PaymentMethod>(
      flat.paymentMethod,
      PAYMENT_METHOD_VALUES,
    ),
    page: parsePage(flat.page),
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };

  const result = await listAdminOrders(filters);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Orders"
        description={`${result.totalCount} order${result.totalCount === 1 ? "" : "s"} total`}
      />

      <form
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-sm border border-beige bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Input
          label="Search"
          name="search"
          defaultValue={flat.search ?? ""}
          placeholder="Order #, name, or email"
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="font-body text-sm font-medium text-primary"
          >
            Order Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={flat.status ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="paymentStatus"
            className="font-body text-sm font-medium text-primary"
          >
            Payment Status
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={flat.paymentStatus ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All payment statuses</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="paymentMethod"
            className="font-body text-sm font-medium text-primary"
          >
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={flat.paymentMethod ?? ""}
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="primary" size="md">
            Apply Filters
          </Button>
          <Link
            href="/admin/orders"
            className={buttonVariants("outline", "md")}
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-sm border border-beige bg-white">
        {result.items.length === 0 ? (
          <Text variant="bodySm" className="p-6 text-muted">
            No orders match these filters.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Payment Status</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-body text-sm text-primary">
                          {order.customerName}
                        </span>
                        <span className="font-body text-xs text-muted">
                          {order.customerEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {PAYMENT_METHODS.find(
                        (m) => m.value === order.paymentMethod,
                      )?.label ?? order.paymentMethod}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
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
            basePath="/admin/orders"
            searchParams={flat}
          />
        </div>
      </div>
    </div>
  );
}
