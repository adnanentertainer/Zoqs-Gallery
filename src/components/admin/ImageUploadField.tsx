"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";

interface ImageUploadFieldProps {
  label: string;
  helpText?: ReactNode;
  /** Empty string means "no image set" — kept as a plain string (not
   * string | null) so callers with a nullable field just coalesce at the
   * boundary, and this component never has to juggle two "empty" states. */
  value: string;
  onChange: (url: string) => void;
  uploadAction: (formData: FormData) => Promise<{ url?: string; error?: string }>;
}

/** Shared file-upload-with-preview control for admin-managed banner/hero
 * images — used by both the per-promo-code hero banner (PromoCodeForm) and
 * the site-wide default hero image (DefaultHeroImageForm) so the upload
 * flow, validation errors, and preview framing stay identical everywhere. */
export function ImageUploadField({
  label,
  helpText,
  value,
  onChange,
  uploadAction,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAction(formData);

    setIsUploading(false);
    if (result.error || !result.url) {
      setError(result.error ?? "Upload failed. Please try again.");
      return;
    }
    onChange(result.url);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-sm font-medium text-primary">
        {label}
      </label>
      {helpText}
      <div className="flex items-start gap-4">
        {value && (
          <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-sm border border-beige">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of a freshly uploaded URL, not worth next/image's remotePatterns/layout machinery here */}
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleSelect}
            disabled={isUploading}
            className="font-body text-sm text-primary file:mr-3 file:rounded-sm file:border-0 file:bg-beige file:px-3 file:py-2 file:font-body file:text-sm file:font-medium file:text-primary hover:file:bg-gold hover:file:text-white"
          />
          {isUploading && (
            <p className="font-body text-xs text-muted">Uploading…</p>
          )}
          {error && <p className="font-body text-xs text-error">{error}</p>}
          {value && !isUploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="self-start font-body text-xs font-medium text-error hover:underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
