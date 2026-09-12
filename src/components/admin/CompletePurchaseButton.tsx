"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { completePurchaseAction } from "@/app/admin/purchases/actions";

export function CompletePurchaseButton({ purchaseId }: { purchaseId: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setIsSubmitting(true);
    setError(null);
    const result = await completePurchaseAction(purchaseId);
    setIsSubmitting(false);
    setConfirmOpen(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <AuthMessage variant="error" message={error} />}
      <Button type="button" variant="primary" size="lg" onClick={() => setConfirmOpen(true)}>
        Complete Purchase
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Complete this purchase?"
        description="This will increase stock for every item on this purchase and record a stock movement for each. This cannot be undone."
        confirmLabel="Complete Purchase"
        isLoading={isSubmitting}
        onConfirm={handleComplete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
