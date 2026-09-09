"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { slugify } from "@/lib/admin/slug";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import type { AdminCategoryInput } from "@/lib/services/admin/adminCategoryService";

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues?: AdminCategoryInput;
}

function emptyCategory(): AdminCategoryInput {
  return {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
    displayOrder: 0,
  };
}

export function CategoryForm({
  mode,
  categoryId,
  initialValues,
}: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminCategoryInput>(
    initialValues ?? emptyCategory(),
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof AdminCategoryInput>(
    key: K,
    value: AdminCategoryInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) update("slug", slugify(name));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const result =
      mode === "create"
        ? await createCategoryAction(values)
        : await updateCategoryAction(categoryId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  async function handleDelete() {
    if (!categoryId) return;
    setIsDeleting(true);
    const result = await deleteCategoryAction(categoryId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        <Input
          label="Name"
          required
          value={values.name}
          onChange={(event) => handleNameChange(event.target.value)}
        />
        <Input
          label="Slug"
          required
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true);
            update("slug", event.target.value);
          }}
        />
        <Input
          label="Image URL"
          className="sm:col-span-2"
          value={values.imageUrl}
          onChange={(event) => update("imageUrl", event.target.value)}
        />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-sm font-medium text-primary">
            Description
          </label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
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
          Active (visible in the shop)
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
            {mode === "create" ? "Create Category" : "Save Changes"}
          </Button>
          <Link
            href="/admin/categories"
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
            Delete Category
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this category?"
        description="This cannot be undone. Categories with products assigned to them can't be deleted."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
