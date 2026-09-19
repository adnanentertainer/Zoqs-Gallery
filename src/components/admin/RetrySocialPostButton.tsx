"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { retrySocialPostAction } from "@/app/admin/social-media/actions";

export function RetrySocialPostButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setIsSubmitting(true);
    setError(null);
    const result = await retrySocialPostAction(productId);
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
        className="font-body text-sm font-medium text-gold hover:underline"
      >
        Post Again
      </button>
      {error && <p className="mt-1 font-body text-xs text-error">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title={`Post "${productName}" again?`}
        description="This publishes a new Facebook and Instagram post for this product, even if it was already posted before."
        confirmLabel="Post Again"
        isDestructive={false}
        isLoading={isSubmitting}
        onConfirm={handleRetry}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
