import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, StatusBadge } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Heading, Text } from "@/components/ui/Typography";
import { getAdminCustomerById } from "@/lib/services/admin/adminCustomerService";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer Detail | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={customer.fullName ?? "Customer"} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-sm border border-beige bg-white p-6">
          <Heading variant="h3" as="h2" className="mb-3">
            Profile
          </Heading>
          <dl className="flex flex-col gap-2">
            <div>
              <Text variant="caption">Email</Text>
              <Text variant="bodySm" className="text-primary">
                {customer.email ?? "—"}
              </Text>
            </div>
            <div>
              <Text variant="caption">Phone</Text>
              <Text variant="bodySm" className="text-primary">
                {customer.phone ?? "—"}
              </Text>
            </div>
            <div>
              <Text variant="caption">Role</Text>
              <Badge variant={customer.role === "admin" ? "gold" : "default"}>
                {customer.role === "admin" ? "Admin" : "Customer"}
              </Badge>
            </div>
            <div>
              <Text variant="caption">Joined</Text>
              <Text variant="bodySm" className="text-primary">
                {new Date(customer.createdAt).toLocaleDateString("en-PK")}
              </Text>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-beige bg-white p-6 lg:col-span-2">
          <Heading variant="h3" as="h2" className="mb-3">
            Recent Orders
          </Heading>
          {customer.recentOrders.length === 0 ? (
            <Text variant="bodySm" className="text-muted">
              No orders yet.
            </Text>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 font-medium">Order</th>
                    <th className="py-2 font-medium">Total</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-beige last:border-b-0"
                    >
                      <td className="py-2 font-body text-sm font-medium text-primary">
                        {order.orderNumber}
                      </td>
                      <td className="py-2 font-body text-sm text-primary">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2 font-body text-sm text-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-PK")}
                      </td>
                      <td className="py-2 text-right">
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
    </div>
  );
}
