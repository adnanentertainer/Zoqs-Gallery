import { CheckoutItem } from "@/components/checkout/CheckoutItem";
import { CheckoutTotals } from "@/components/checkout/CheckoutTotals";
import { Heading, Text } from "@/components/ui/Typography";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/checkout/orderLabels";
import type { Order } from "@/types/order";

export function OrderTrackingResult({ order }: { order: Order }) {
  const paymentMethod = PAYMENT_METHODS.find(
    (method) => method.value === order.paymentMethod,
  );
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 rounded-sm border border-beige p-6">
      <div className="flex flex-col gap-1 border-b border-beige pb-4">
        <Text variant="caption">Order</Text>
        <Heading variant="h3" as="h2">
          {order.orderNumber}
        </Heading>
        <Text variant="bodySm" className="text-muted">
          Placed on {orderDate}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Text variant="caption">Order Status</Text>
          <Text variant="body" className="font-medium text-primary">
            {orderStatusLabel[order.status]}
          </Text>
        </div>
        <div>
          <Text variant="caption">Payment Method</Text>
          <Text variant="body" className="font-medium text-primary">
            {paymentMethod?.label ?? order.paymentMethod}
          </Text>
        </div>
        <div>
          <Text variant="caption">Payment Status</Text>
          <Text variant="body" className="font-medium text-primary">
            {paymentStatusLabel[order.paymentStatus]}
          </Text>
        </div>
      </div>

      <div>
        <Heading variant="h3" as="h2" className="mb-3">
          Shipping To
        </Heading>
        <Text variant="bodySm" className="text-primary">
          {order.shippingAddress.fullName}
          <br />
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

      <div>
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
  );
}
