"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  updateAdminBridalBannerImageAction,
  uploadBridalBannerImageAction,
} from "@/app/admin/settings/actions";

export function BridalBannerImageForm({
  initialValue,
}: {
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(url: string) {
    setValue(url);
    setSuccess(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminBridalBannerImageAction(value);

    setIsSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 rounded-sm border border-beige bg-white p-6">
      {error && <AuthMessage variant="error" message={error} />}
      {success && (
        <AuthMessage variant="success" message="Bridal banner image saved." />
      )}

      <ImageUploadField
        label="Bridal Banner Image (optional)"
        helpText={
          <>
            <p className="font-body text-xs text-muted">
              Used by the Bridal Collection Banner section on the homepage
              (Classic Split, Editorial Full-Bleed and Side Accent layouts —
              see Admin → Layout). Leave empty to keep the site&apos;s
              built-in placeholder photo.
            </p>
            <p className="font-body text-xs text-muted">
              Upload a tall <strong>portrait photo, cropped to a 4:5 ratio</strong>{" "}
              (e.g. 1200&times;1500px) -- it&apos;s re-cropped automatically
              for the wider landscape layouts.
            </p>
          </>
        }
        value={value}
        onChange={handleChange}
        uploadAction={uploadBridalBannerImageAction}
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSaving}
        onClick={handleSave}
      >
        Save Bridal Banner Image
      </Button>
    </div>
  );
}
