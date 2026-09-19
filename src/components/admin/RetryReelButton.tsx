"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { retryReelAction } from "@/app/admin/reels/actions";

export function RetryReelButton({
  reelId,
  productName,
}: {
  reelId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setIsSubmitting(true);
    setError(null);
    const result = await retryReelAction(reelId);
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
        title={`Post this reel for "${productName}" again?`}
        description="This re-publishes the same video to Facebook and Instagram, even if it was already posted before."
        confirmLabel="Post Again"
        isDestructive={false}
        isLoading={isSubmitting}
        onConfirm={handleRetry}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
