"use client";

import { useState, type FormEvent } from "react";
import { AuthMessage } from "@/components/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OrderTrackingResult } from "@/components/track-order/OrderTrackingResult";
import { trackOrder } from "@/app/track-order/actions";
import type { Order } from "@/types/order";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setOrder(null);

    const result = await trackOrder(orderNumber, contact);

    setIsSubmitting(false);
    if (result.error || !result.order) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setOrder(result.order);
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-sm border border-beige p-6"
      >
        {error && <AuthMessage variant="error" message={error} />}

        <Input
          label="Order Number"
          name="orderNumber"
          placeholder="e.g. ZOQ-20260917-0123"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          required
        />
        <Input
          label="Email or Phone Number"
          name="contact"
          placeholder="Used at checkout"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Track Order
        </Button>
      </form>

      {order && <OrderTrackingResult order={order} />}
    </div>
  );
}
