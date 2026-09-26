"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  deleteSocialCampaignAction,
  setSocialCampaignStatusAction,
} from "@/app/admin/social-campaigns/actions";
import type { SocialCampaignStatus } from "@/types/socialCampaign";

export function SocialCampaignRowActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: SocialCampaignStatus;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetStatus(next: SocialCampaignStatus) {
    setIsSubmitting(true);
    setError(null);
    const result = await setSocialCampaignStatusAction(campaignId, next);
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
    const result = await deleteSocialCampaignAction(campaignId);
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
          href={`/admin/social-campaigns/${campaignId}`}
          className="font-body text-sm font-medium text-gold hover:underline"
        >
          Manage
        </Link>
        {status === "active" ? (
          <button
            type="button"
            onClick={() => handleSetStatus("paused")}
            disabled={isSubmitting}
            className="font-body text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            Pause
          </button>
        ) : status === "paused" || status === "draft" ? (
          <button
            type="button"
            onClick={() => handleSetStatus("active")}
            disabled={isSubmitting}
            className="font-body text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            Activate
          </button>
        ) : null}
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
        title="Delete this campaign?"
        description="This cannot be undone. Reward codes already issued from this campaign remain valid and redeemable — only new participation stops."
        confirmLabel="Delete"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
