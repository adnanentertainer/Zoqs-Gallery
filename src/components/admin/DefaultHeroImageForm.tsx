"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  updateAdminDefaultHeroImageAction,
  uploadDefaultHeroImageAction,
} from "@/app/admin/settings/actions";

export function DefaultHeroImageForm({
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

    const result = await updateAdminDefaultHeroImageAction(value);

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
        <AuthMessage variant="success" message="Hero image saved." />
      )}

      <ImageUploadField
        label="Default Hero Image (optional)"
        helpText={
          <>
            <p className="font-body text-xs text-muted">
              Shown on the homepage whenever no scheduled promo code
              currently has its own hero banner live (see Promo Codes).
              Leave empty to keep the site&apos;s built-in default photo.
            </p>
            <p className="font-body text-xs text-muted">
              Upload a tall <strong>portrait photo, cropped to a 4:5 ratio</strong>{" "}
              (e.g. 1200&times;1500px) to match the hero&apos;s frame.
            </p>
          </>
        }
        value={value}
        onChange={handleChange}
        uploadAction={uploadDefaultHeroImageAction}
      />

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSaving}
        onClick={handleSave}
      >
        Save Hero Image
      </Button>
    </div>
  );
}
