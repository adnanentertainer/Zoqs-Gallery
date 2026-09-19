"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { Heading, Text } from "@/components/ui/Typography";
import { confirmOrderWhatsAppAction } from "@/app/admin/orders/actions";
import { formatPrice, toWhatsAppPhoneNumber } from "@/lib/utils";

interface WhatsAppConfirmationCardProps {
  orderId: string;
  orderNumber: string;
  total: number;
  customerName: string;
  customerPhone: string;
  whatsappConfirmedAt: string | null;
}

export function WhatsAppConfirmationCard({
  orderId,
  orderNumber,
  total,
  customerName,
  customerPhone,
  whatsappConfirmedAt,
}: WhatsAppConfirmationCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = `Hi ${customerName}, this is ZOQ's Gallery confirming your order #${orderNumber} (${formatPrice(
    total,
  )}, Cash on Delivery). Please reply YES to confirm, or let us know if you'd like to cancel.`;
  const whatsappHref = `https://wa.me/${toWhatsAppPhoneNumber(customerPhone)}?text=${encodeURIComponent(message)}`;

  async function handleConfirm() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const result = await confirmOrderWhatsAppAction(orderId);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-beige bg-white p-6">
      <Heading variant="h3" as="h2" className="mb-3">
        WhatsApp Confirmation
      </Heading>
      {error && <AuthMessage variant="error" message={error} />}

      {whatsappConfirmedAt ? (
        <Text variant="bodySm" className="text-primary">
          ✓ Customer confirmed via WhatsApp on{" "}
          {new Date(whatsappConfirmedAt).toLocaleString("en-PK")}
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          <Text variant="bodySm" className="text-muted">
            This is a Cash on Delivery order — confirm with the customer over
            WhatsApp before moving it to Confirmed, Processing, or Shipped.
          </Text>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-primary px-6 font-body text-sm font-medium tracking-wide text-white transition-colors hover:bg-primary/90"
            >
              Confirm via WhatsApp
            </a>
            <Button
              type="button"
              variant="outline"
              size="md"
              isLoading={isSubmitting}
              onClick={handleConfirm}
            >
              Mark Customer Confirmed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
