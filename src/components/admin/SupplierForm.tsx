"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierAction,
} from "@/app/admin/suppliers/actions";
import type { AdminSupplierInput } from "@/types/admin";

interface SupplierFormProps {
  mode: "create" | "edit";
  supplierId?: string;
  initialValues?: AdminSupplierInput;
  products?: { id: string; name: string; sku: string | null; stock: number }[];
}

function emptySupplier(): AdminSupplierInput {
  return {
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    status: "active",
  };
}

export function SupplierForm({
  mode,
  supplierId,
  initialValues,
  products,
}: SupplierFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminSupplierInput>(
    initialValues ?? emptySupplier(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof AdminSupplierInput>(
    key: K,
    value: AdminSupplierInput[K],
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
        ? await createSupplierAction(values)
        : await updateSupplierAction(supplierId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/suppliers");
    router.refresh();
  }

  async function handleDelete() {
    if (!supplierId) return;
    setIsDeleting(true);
    const result = await deleteSupplierAction(supplierId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/suppliers");
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
          onChange={(event) => update("name", event.target.value)}
        />
        <Input
          label="Contact Person"
          value={values.contactPerson}
          onChange={(event) => update("contactPerson", event.target.value)}
        />
        <Input
          label="Phone"
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-sm font-medium text-primary">
            Address
          </label>
          <textarea
            rows={2}
            value={values.address}
            onChange={(event) => update("address", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-sm font-medium text-primary">
            Notes
          </label>
          <textarea
            rows={2}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Status
          </label>
          <select
            value={values.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value as AdminSupplierInput["status"],
              )
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {mode === "edit" && products && (
        <div className="rounded-sm border border-beige bg-white p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Supplied Products
          </h2>
          {products.length === 0 ? (
            <p className="font-body text-sm text-muted">
              No products are assigned to this supplier yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between border-b border-beige pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="font-body text-sm text-primary">
                    {product.name}
                    {product.sku && (
                      <span className="ml-2 text-xs text-muted">
                        {product.sku}
                      </span>
                    )}
                  </span>
                  <span className="font-body text-sm text-muted">
                    Stock: {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
          >
            {mode === "create" ? "Create Supplier" : "Save Changes"}
          </Button>
          <Link
            href="/admin/suppliers"
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
            Delete Supplier
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this supplier?"
        description="This cannot be undone. Suppliers still assigned to products or with purchase history can't be deleted."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
