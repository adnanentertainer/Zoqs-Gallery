import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { buildOrderInfoWhatsAppLink } from "@/lib/whatsapp/orderMessageLink";
import type { OrderStatus } from "@/types/order";

interface OrderWhatsAppButtonProps {
  orderNumber: string;
  total: number;
  paymentMethodLabel: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
}

/**
 * Plain wa.me deep link, same free mechanism as the customer's own "Send
 * Order Details via WhatsApp" button on the order confirmation page
 * (src/components/checkout/OrderConfirmation.tsx) -- just the reverse
 * direction: this opens WhatsApp for the ADMIN to message the customer with
 * order info already filled in, one click, no Meta Cloud API, no template,
 * no payment method required. Shown for every order regardless of payment
 * method -- separate from WhatsAppConfirmationCard's COD-only confirm/cancel
 * flow, which stays untouched.
 */
export function OrderWhatsAppButton({
  orderNumber,
  total,
  paymentMethodLabel,
  customerName,
  customerPhone,
  status,
}: OrderWhatsAppButtonProps) {
  const whatsAppHref = buildOrderInfoWhatsAppLink({
    customerName,
    customerPhone,
    orderNumber,
    total,
    paymentMethodLabel,
    status,
  });

  return (
    <div className="rounded-sm border border-beige bg-white p-6">
      <Heading variant="h3" as="h2" className="mb-3">
        Message Customer
      </Heading>
      <Text variant="bodySm" className="mb-3 text-muted">
        Opens WhatsApp with the order details already filled in — review and
        send from your own number.
      </Text>
      <a
        href={whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants("primary", "md", "w-full justify-center")}
      >
        <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
        Send Order Info via WhatsApp
      </a>
    </div>
  );
}
