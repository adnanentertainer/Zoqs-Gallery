"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  approveReviewAction,
  deleteReviewAction,
  unapproveReviewAction,
} from "@/app/admin/reviews/actions";

interface ReviewModerationActionsProps {
  reviewId: string;
  isApproved: boolean;
}

export function ReviewModerationActions({
  reviewId,
  isApproved,
}: ReviewModerationActionsProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleApproval() {
    setIsSubmitting(true);
    setError(null);
    const result = isApproved
      ? await unapproveReviewAction(reviewId)
      : await approveReviewAction(reviewId);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    setIsSubmitting(true);
    setError(null);
    const result = await deleteReviewAction(reviewId);
    setIsSubmitting(false);
    setConfirmDelete(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <AuthMessage variant="error" message={error} />}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          isLoading={isSubmitting}
          onClick={handleToggleApproval}
        >
          {isApproved ? "Unapprove" : "Approve"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-error hover:bg-error/10"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this review?"
        description="This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
