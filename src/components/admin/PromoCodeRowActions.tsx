"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  deletePromoCodeAction,
  setPromoCodeActiveAction,
} from "@/app/admin/promo-codes/actions";

export function PromoCodeRowActions({
  promoCodeId,
  code,
  isActive,
}: {
  promoCodeId: string;
  code: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setIsSubmitting(true);
    setError(null);
    const result = await setPromoCodeActiveAction(promoCodeId, !isActive);
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
    const result = await deletePromoCodeAction(promoCodeId);
    setIsSubmitting(false);
    setConfirmDelete(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-4">
        <Link
          href={`/admin/promo-codes/${promoCodeId}`}
          className="font-body text-sm font-medium text-gold hover:underline"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="font-body text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="font-body text-sm font-medium text-error hover:underline"
        >
          Delete
        </button>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${code}?`}
        description="This cannot be undone. Orders that already used this code keep their own record of the discount, so deleting it is safe."
        confirmLabel="Delete"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
