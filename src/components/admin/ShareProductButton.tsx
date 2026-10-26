"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { shareProductToSocialAction } from "@/app/admin/products/actions";

export function ShareProductButton({
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
  const [success, setSuccess] = useState<string | null>(null);

  async function handleShare() {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    const result = await shareProductToSocialAction(productId);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const posted: string[] = [];
    if (result.facebookStatus === "success") posted.push("Facebook");
    if (result.instagramStatus === "success") posted.push("Instagram");
    if (result.tiktokStatus === "success") posted.push("TikTok drafts");

    if (posted.length > 0) {
      setSuccess(`Shared to ${posted.join(" & ")}.`);
    } else {
      setError(
        result.facebookError ??
          result.instagramError ??
          result.tiktokError ??
          "Nothing was posted — check Social Auto-Post settings.",
      );
    }

    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="font-body text-sm font-medium text-gold hover:underline"
      >
        Share
      </button>
      {error && (
        <p className="max-w-[200px] text-right font-body text-xs text-error">
          {error}
        </p>
      )}
      {success && (
        <p className="max-w-[200px] text-right font-body text-xs text-success">
          {success}
        </p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={`Share "${productName}"?`}
        description="This posts the product's photo to Facebook and Instagram, and drops a TikTok draft video into your inbox, right now, using the Social Auto-Post settings."
        confirmLabel="Share Now"
        isDestructive={false}
        isLoading={isSubmitting}
        onConfirm={handleShare}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
