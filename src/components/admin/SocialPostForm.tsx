"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  createSocialPostAction,
  deleteSocialPostAction,
  updateSocialPostAction,
} from "@/app/admin/social-posts/actions";
import type { AdminSocialPostInput } from "@/types/admin";

interface SocialPostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: AdminSocialPostInput;
}

function emptySocialPost(): AdminSocialPostInput {
  return {
    imageUrl: "",
    alt: "",
    href: "",
    isActive: true,
    displayOrder: 0,
  };
}

export function SocialPostForm({
  mode,
  postId,
  initialValues,
}: SocialPostFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminSocialPostInput>(
    initialValues ?? emptySocialPost(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof AdminSocialPostInput>(
    key: K,
    value: AdminSocialPostInput[K],
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
        ? await createSocialPostAction(values)
        : await updateSocialPostAction(postId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/social-posts");
    router.refresh();
  }

  async function handleDelete() {
    if (!postId) return;
    setIsDeleting(true);
    const result = await deleteSocialPostAction(postId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/social-posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        <Input
          label="Image URL"
          required
          className="sm:col-span-2"
          value={values.imageUrl}
          onChange={(event) => update("imageUrl", event.target.value)}
        />
        {values.imageUrl && (
          <div className="relative h-32 w-32 overflow-hidden rounded-sm bg-beige sm:col-span-2">
            <Image
              src={values.imageUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Input
            label="Alt Text"
            required
            value={values.alt}
            onChange={(event) => update("alt", event.target.value)}
          />
          <p className="font-body text-xs text-muted">
            Describes the photo for screen readers and search engines.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Input
            label="Link"
            value={values.href}
            onChange={(event) => update("href", event.target.value)}
            placeholder="https://instagram.com/p/..."
          />
          <p className="font-body text-xs text-muted">
            Optional. Link to a specific Instagram or Facebook post — leave
            blank to use the site&apos;s Instagram profile.
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
          Active (visible in the gallery)
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
          >
            {mode === "create" ? "Add Post" : "Save Changes"}
          </Button>
          <Link
            href="/admin/social-posts"
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
            Delete Post
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this post?"
        description="This cannot be undone. The post will be removed from the homepage gallery."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
