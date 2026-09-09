import Link from "next/link";
import {
  Package,
  CheckCircle2,
  FolderTree,
  Users,
  ShoppingBag,
  Clock,
  Wallet,
} from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { MetricCard } from "@/components/admin/MetricCard";
import { Text } from "@/components/ui/Typography";
import { getDashboardMetrics } from "@/lib/services/admin/dashboardService";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Dashboard"
        description="An overview of your store, straight from the database."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Products"
          value={String(metrics.totalProducts)}
          icon={Package}
        />
        <MetricCard
          label="Active Products"
          value={String(metrics.activeProducts)}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Total Categories"
          value={String(metrics.totalCategories)}
          icon={FolderTree}
        />
        <MetricCard
          label="Total Customers"
          value={String(metrics.totalCustomers)}
          icon={Users}
        />
        <MetricCard
          label="Total Orders"
          value={String(metrics.totalOrders)}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Pending Orders"
          value={String(metrics.pendingOrders)}
          icon={Clock}
        />
        <MetricCard
          label="Total Order Value"
          value={formatPrice(metrics.totalOrderValue)}
          icon={Wallet}
        />
      </div>
      <Text variant="caption" className="-mt-4">
        Total Order Value sums non-cancelled order totals — it is not collected
        payment. Cash on Delivery orders may still be unpaid.
      </Text>

      <div className="rounded-sm border border-beige bg-white">
        <div className="flex items-center justify-between border-b border-beige p-5">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="font-body text-sm font-medium text-gold hover:underline"
          >
            View all
          </Link>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <Text variant="bodySm" className="p-5 text-muted">
            No orders yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-beige last:border-b-0"
                  >
                    <td className="px-5 py-3 font-body text-sm font-medium text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-primary">
                      {order.customerName}
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
      </div>
    </div>
  );
}
