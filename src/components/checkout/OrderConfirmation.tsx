import Link from "next/link";
import { CheckCircle2, ShoppingBag, User } from "lucide-react";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { CheckoutItem } from "@/components/checkout/CheckoutItem";
import { CheckoutTotals } from "@/components/checkout/CheckoutTotals";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { PAYMENT_METHODS } from "@/lib/checkout/paymentMethods";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import type { Order } from "@/types/order";

const RECEIPT_PAYMENT_METHODS: Order["paymentMethod"][] = [
  "easypaisa",
  "jazzcash",
  "bank_transfer",
];

const orderStatusLabel: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentStatusLabel: Record<Order["paymentStatus"], string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function OrderConfirmation({
  order,
  isGuest = false,
}: {
  order: Order;
  isGuest?: boolean;
}) {
  const paymentMethod = PAYMENT_METHODS.find(
    (method) => method.value === order.paymentMethod,
  );
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const needsReceipt = RECEIPT_PAYMENT_METHODS.includes(order.paymentMethod);
  const whatsAppMessage = needsReceipt
    ? `Hi ${siteConfig.name}! I've placed order ${order.orderNumber} for ${formatPrice(order.total)} via ${paymentMethod?.label ?? order.paymentMethod}. Here is my payment receipt.`
    : `Hi ${siteConfig.name}! I've placed order ${order.orderNumber} for ${formatPrice(order.total)} via ${paymentMethod?.label ?? order.paymentMethod}.`;
  const whatsAppHref = `${siteConfig.socialLinks.whatsapp}?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <Heading variant="h1" as="h1">
          Thank you for your order
        </Heading>
        <Text variant="body" className="text-muted">
          Order{" "}
          <span className="font-medium text-primary">{order.orderNumber}</span>{" "}
          placed on {orderDate}
        </Text>
      </div>

      <AuthMessage
        variant="success"
        message={
          paymentMethod?.confirmationMessage ?? "Your order has been received."
        }
      />

      <div className="flex flex-col items-center gap-3 rounded-sm border border-beige bg-secondary p-6 text-center">
        <Text variant="bodySm" className="text-muted">
          {needsReceipt
            ? "Tap below to open WhatsApp with your order details already filled in — just attach your payment receipt and hit send."
            : "Tap below to open WhatsApp with your order details already filled in — just hit send to let us know."}
        </Text>
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants("primary", "lg", "h-14 text-base")}
        >
          <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
          Send Order Details via WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige p-6 sm:grid-cols-2">
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

      <div className="rounded-sm border border-beige p-6">
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
          <br />
          {order.shippingAddress.phone}
        </Text>
        {order.customerNotes && (
          <>
            <Text variant="caption" className="mt-4">
              Order Notes
            </Text>
            <Text variant="bodySm" className="text-primary">
              {order.customerNotes}
            </Text>
          </>
        )}
      </div>

      <div className="rounded-sm border border-beige p-6">
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

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/shop"
          className={buttonVariants(
            "outline",
            "lg",
            "h-14 flex-1 text-base",
          )}
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          Continue Shopping
        </Link>
        <Link
          href={isGuest ? "/signup" : "/account"}
          className={buttonVariants(
            "primary",
            "lg",
            "h-14 flex-1 text-base",
          )}
        >
          <User className="h-5 w-5" aria-hidden="true" />
          {isGuest ? "Create an Account" : "My Account"}
        </Link>
      </div>
    </div>
  );
}
