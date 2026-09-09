"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import type { OrderStatus, PaymentStatus } from "@/types/order";

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

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";

interface OrderStatusFormProps {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPaymentStatus, setNextPaymentStatus] = useState(paymentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateOrderStatusAction(orderId, {
      status: nextStatus,
      paymentStatus: nextPaymentStatus,
    });

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  const hasChanges =
    nextStatus !== status || nextPaymentStatus !== paymentStatus;

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        Update Order
      </h2>
      {error && <AuthMessage variant="error" message={error} />}
      {success && !hasChanges && (
        <AuthMessage variant="success" message="Order updated." />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="order-status"
            className="font-body text-sm font-medium text-primary"
          >
            Order Status
          </label>
          <select
            id="order-status"
            value={nextStatus}
            onChange={(event) =>
              setNextStatus(event.target.value as OrderStatus)
            }
            className={selectStyles}
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="payment-status"
            className="font-body text-sm font-medium text-primary"
          >
            Payment Status
          </label>
          <select
            id="payment-status"
            value={nextPaymentStatus}
            onChange={(event) =>
              setNextPaymentStatus(event.target.value as PaymentStatus)
            }
            className={selectStyles}
          >
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button
        type="button"
        variant="primary"
        size="md"
        className="w-fit"
        isLoading={isSubmitting}
        disabled={!hasChanges}
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </div>
  );
}
