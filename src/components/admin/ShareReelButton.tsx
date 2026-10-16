"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { retryReelAction } from "@/app/admin/reels/actions";

export function ShareReelButton({
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

  async function handleShare() {
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
        Share
      </button>
      {error && <p className="mt-1 font-body text-xs text-error">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title={`Share this reel for "${productName}"?`}
        description="This posts the reel's video to Facebook and Instagram right now, even if it was already posted before."
        confirmLabel="Share Now"
        isDestructive={false}
        isLoading={isSubmitting}
        onConfirm={handleShare}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
