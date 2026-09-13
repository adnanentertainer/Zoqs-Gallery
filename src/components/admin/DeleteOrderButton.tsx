"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteOrderAction } from "@/app/admin/orders/actions";

export function DeleteOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsSubmitting(true);
    setError(null);
    const result = await deleteOrderAction(orderId);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="font-body text-sm font-medium text-error hover:underline"
      >
        Delete
      </button>
      {error && (
        <p className="mt-1 font-body text-xs text-error">{error}</p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete order ${orderNumber}?`}
        description="This permanently removes the order and its line items. This cannot be undone."
        confirmLabel="Delete"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
