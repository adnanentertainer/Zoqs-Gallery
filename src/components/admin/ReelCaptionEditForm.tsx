"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateReelCaptionAction } from "@/app/admin/reels/actions";
import type { ProductReelRecord } from "@/types/socialMedia";

const fieldLabelStyles = "font-body text-sm font-medium text-primary";

interface ReelCaptionEditFormProps {
  reel: ProductReelRecord;
}

export function ReelCaptionEditForm({ reel }: ReelCaptionEditFormProps) {
  const [caption, setCaption] = useState(reel.caption);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasLiveFacebookPost = Boolean(reel.facebookVideoId) && reel.facebookStatus === "success";
  const hasLiveInstagramPost = Boolean(reel.instagramMediaId) && reel.instagramStatus === "success";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const result = await updateReelCaptionAction(reel.id, caption);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setSuccessMessage(
      result.facebookUpdated
        ? "Caption saved and updated on the live Facebook post."
        : "Caption saved.",
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}
      {successMessage && <AuthMessage variant="success" message={successMessage} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6">
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Caption</label>
          <textarea
            required
            rows={9}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-2 rounded-sm bg-beige/50 p-4 font-body text-xs text-muted">
          <p>
            <strong className="text-primary">Facebook:</strong>{" "}
            {hasLiveFacebookPost
              ? "Saving here updates the caption on the already-published post."
              : "Not published successfully on Facebook, so there's nothing live to update — this only saves our own record."}
          </p>
          <p>
            <strong className="text-primary">Instagram:</strong>{" "}
            {hasLiveInstagramPost
              ? "Meta's API has no way to edit a caption after publishing, so this can't be changed here — edit it directly in the Instagram app if needed. Saving here only updates our own record."
              : "Not published successfully on Instagram, so there's nothing live to update — this only saves our own record."}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          Save Caption
        </Button>
        <Link href="/admin/reels" className={buttonVariants("outline", "lg")}>
          Back
        </Link>
      </div>
    </form>
  );
}
