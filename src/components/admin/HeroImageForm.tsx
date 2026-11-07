"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  createHeroImageAction,
  deleteHeroImageAction,
  updateHeroImageAction,
  uploadHeroImageAction,
} from "@/app/admin/hero-images/actions";
import type { AdminHeroImageInput } from "@/types/heroImage";

interface HeroImageFormProps {
  mode: "create" | "edit";
  imageId?: string;
  initialValues?: AdminHeroImageInput;
}

function emptyHeroImage(): AdminHeroImageInput {
  return {
    imageUrl: "",
    altText: "",
    isActive: true,
    displayOrder: 0,
  };
}

export function HeroImageForm({
  mode,
  imageId,
  initialValues,
}: HeroImageFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminHeroImageInput>(
    initialValues ?? emptyHeroImage(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof AdminHeroImageInput>(
    key: K,
    value: AdminHeroImageInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const result =
      mode === "create"
        ? await createHeroImageAction(values)
        : await updateHeroImageAction(imageId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/hero-images");
    router.refresh();
  }

  async function handleDelete() {
    if (!imageId) return;
    setIsDeleting(true);
    const result = await deleteHeroImageAction(imageId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/hero-images");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6">
        <ImageUploadField
          label="Image"
          helpText={
            <p className="font-body text-xs text-muted">
              Upload a tall <strong>portrait photo, cropped to a 4:5 ratio</strong>{" "}
              (e.g. 1200&times;1500px) so it frames the same way across every
              hero layout.
            </p>
          }
          value={values.imageUrl}
          onChange={(url) => update("imageUrl", url)}
          uploadAction={uploadHeroImageAction}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Input
              label="Alt Text (optional)"
              value={values.altText}
              onChange={(event) => update("altText", event.target.value)}
              placeholder="Bride wearing a gold statement necklace"
            />
            <p className="font-body text-xs text-muted">
              Describes the photo for screen readers and search engines.
            </p>
          </div>
          <Input
            label="Display Order"
            type="number"
            value={values.displayOrder}
            onChange={(event) =>
              update("displayOrder", Number(event.target.value))
            }
          />
          <label className="flex items-end gap-2 font-body text-sm text-primary">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => update("isActive", event.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Active (included in the carousel)
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
          >
            {mode === "create" ? "Add Image" : "Save Changes"}
          </Button>
          <Link
            href="/admin/hero-images"
            className={buttonVariants("outline", "lg")}
          >
            Cancel
          </Link>
        </div>
        {mode === "edit" && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="text-error hover:bg-error/10"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Image
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this image?"
        description="This cannot be undone. The image will be removed from the homepage hero carousel."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
