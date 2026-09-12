import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { CheckoutItem, CheckoutTotals } from "@/components/checkout";
import { Heading, Text } from "@/components/ui/Typography";
import { getAdminOrderById } from "@/lib/services/admin/adminOrderService";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";

export const metadata: Metadata = {
  title: "Order Detail | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const paymentMethod = PAYMENT_METHODS.find(
    (method) => method.value === order.paymentMethod,
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${new Date(order.createdAt).toLocaleString("en-PK")}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <OrderStatusForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
          />

          <div className="rounded-sm border border-beige bg-white p-6">
            <Heading variant="h3" as="h2" className="mb-3">
              Items
            </Heading>
            {order.items.map((item) => (
              <CheckoutItem
                key={item.id}
                item={{
                  key: item.id,
                  imageUrl: item.productImageUrl,
                  name: item.productName,
                  variantLabel: item.variantName,
                  quantity: item.quantity,
                  lineTotal: item.lineTotal,
                }}
              />
            ))}
            <CheckoutTotals
              subtotal={order.subtotal}
              shippingCost={order.shippingCost}
              total={order.total}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-beige bg-white p-6">
            <Heading variant="h3" as="h2" className="mb-3">
              Customer
            </Heading>
            <Text variant="bodySm" className="text-primary">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.email}
              <br />
              {order.shippingAddress.phone}
            </Text>
          </div>

          <div className="rounded-sm border border-beige bg-white p-6">
            <Heading variant="h3" as="h2" className="mb-3">
              Shipping Address
            </Heading>
            <Text variant="bodySm" className="text-primary">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              )}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
              {order.shippingAddress.postalCode &&
                ` ${order.shippingAddress.postalCode}`}
              <br />
              {order.shippingAddress.country}
            </Text>
          </div>

          <div className="rounded-sm border border-beige bg-white p-6">
            <Heading variant="h3" as="h2" className="mb-3">
              Payment
            </Heading>
            <Text variant="bodySm" className="text-primary">
              Method: {paymentMethod?.label ?? order.paymentMethod}
            </Text>
          </div>

          {order.customerNotes && (
            <div className="rounded-sm border border-beige bg-white p-6">
              <Heading variant="h3" as="h2" className="mb-3">
                Order Notes
              </Heading>
              <Text variant="bodySm" className="text-primary">
                {order.customerNotes}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
