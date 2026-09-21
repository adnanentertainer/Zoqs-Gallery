"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  deletePromoBannerAction,
  setPromoBannerActiveAction,
} from "@/app/admin/promo-banners/actions";

export function PromoBannerRowActions({
  bannerId,
  title,
  isActive,
}: {
  bannerId: string;
  title: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setIsSubmitting(true);
    setError(null);
    const result = await setPromoBannerActiveAction(bannerId, !isActive);
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
    const result = await deletePromoBannerAction(bannerId);
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
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm font-medium text-primary hover:underline"
        >
          Preview
        </Link>
        <Link
          href={`/admin/promo-banners/${bannerId}`}
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
        title={`Delete "${title}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
