"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";
import {
  createPurchaseAction,
  deletePurchaseAction,
  updatePurchaseAction,
} from "@/app/admin/purchases/actions";
import type {
  AdminPurchaseInput,
  AdminPurchaseItemInput,
  PurchaseStatus,
  ProductOption,
  SupplierOption,
} from "@/types/admin";

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";
const fieldLabelStyles = "font-body text-sm font-medium text-primary";

interface PurchaseFormProps {
  mode: "create" | "edit";
  purchaseId?: string;
  purchaseNumber?: string;
  status?: PurchaseStatus;
  initialValues?: AdminPurchaseInput;
  suppliers: SupplierOption[];
  products: ProductOption[];
}

function emptyPurchase(): AdminPurchaseInput {
  return {
    supplierId: "",
    paymentStatus: "unpaid",
    notes: "",
    items: [],
  };
}

function emptyItem(): AdminPurchaseItemInput {
  return {
    productId: "",
    variantId: null,
    productName: "",
    sku: "",
    quantity: 1,
    costPrice: 0,
  };
}

export function PurchaseForm({
  mode,
  purchaseId,
  purchaseNumber,
  status,
  initialValues,
  suppliers,
  products,
}: PurchaseFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminPurchaseInput>(
    initialValues ?? emptyPurchase(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isReadOnly = mode === "edit" && status !== undefined && status !== "pending";
  const total = useMemo(
    () => values.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0),
    [values.items],
  );

  function update<K extends keyof AdminPurchaseInput>(
    key: K,
    value: AdminPurchaseInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<AdminPurchaseItemInput>) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    setValues((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      updateItem(index, { productId: "", variantId: null, productName: "", sku: "" });
      return;
    }
    updateItem(index, {
      productId: product.id,
      variantId: null,
      productName: product.name,
      sku: product.sku ?? "",
    });
  }

  function handleVariantSelect(index: number, variantId: string) {
    const item = values.items[index];
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    updateItem(index, {
      variantId: variantId || null,
      sku: variant?.sku ?? product?.sku ?? "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isReadOnly) return;
    setIsSubmitting(true);
    setFormError(null);

    const result =
      mode === "create"
        ? await createPurchaseAction(values)
        : await updatePurchaseAction(purchaseId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/purchases");
    router.refresh();
  }

  async function handleDelete() {
    if (!purchaseId) return;
    setIsDeleting(true);
    const result = await deletePurchaseAction(purchaseId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/purchases");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}
      {isReadOnly && status && (
        <p className="rounded-sm border border-beige bg-beige/40 px-4 py-3 font-body text-sm text-muted">
          {`This purchase is ${status} and can no longer be edited.`}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        {mode === "edit" && (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Purchase Number</label>
            <p className="font-body text-sm text-primary">{purchaseNumber}</p>
          </div>
        )}
        {mode === "edit" && status && (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Status</label>
            <div>
              <StatusBadge status={status} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Supplier</label>
          <select
            required
            disabled={isReadOnly}
            value={values.supplierId}
            onChange={(event) => update("supplierId", event.target.value)}
            className={selectStyles}
          >
            <option value="" disabled>
              Select a supplier
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Payment Status</label>
          <select
            disabled={isReadOnly}
            value={values.paymentStatus}
            onChange={(event) =>
              update(
                "paymentStatus",
                event.target.value as AdminPurchaseInput["paymentStatus"],
              )
            }
            className={selectStyles}
          >
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={fieldLabelStyles}>Notes</label>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-beige/40"
          />
        </div>
      </div>

      <div className="rounded-sm border border-beige bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-primary">Items</h2>
          {!isReadOnly && (
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              Add Item
            </Button>
          )}
        </div>

        {values.items.length === 0 ? (
          <p className="font-body text-sm text-muted">No items added yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {values.items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 border-b border-beige pb-4 last:border-b-0 last:pb-0 sm:grid-cols-5"
                >
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className={fieldLabelStyles}>Product</label>
                    <select
                      required
                      disabled={isReadOnly}
                      value={item.productId}
                      onChange={(event) => handleProductSelect(index, event.target.value)}
                      className={selectStyles}
                    >
                      <option value="" disabled>
                        Select a product
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.sku ? ` (${p.sku})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {product && product.variants.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className={fieldLabelStyles}>Variant</label>
                      <select
                        disabled={isReadOnly}
                        value={item.variantId ?? ""}
                        onChange={(event) => handleVariantSelect(index, event.target.value)}
                        className={selectStyles}
                      >
                        <option value="">Base product</option>
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Input
                    label="Quantity"
                    type="number"
                    min={1}
                    required
                    disabled={isReadOnly}
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, { quantity: Number(event.target.value) })
                    }
                  />
                  <Input
                    label="Cost Price"
                    type="number"
                    min={0}
                    required
                    disabled={isReadOnly}
                    value={item.costPrice}
                    onChange={(event) =>
                      updateItem(index, { costPrice: Number(event.target.value) })
                    }
                  />

                  <div className="flex items-end justify-between gap-2 sm:col-span-5">
                    <p className="font-body text-sm text-muted">
                      Line total: {formatPrice(item.quantity * item.costPrice)}
                    </p>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="inline-flex items-center gap-1 font-body text-sm text-error hover:underline"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end border-t border-beige pt-4">
          <p className="font-body text-base font-semibold text-primary">
            Total: {formatPrice(total)}
          </p>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
              {mode === "create" ? "Create Purchase" : "Save Changes"}
            </Button>
            <Link href="/admin/purchases" className={buttonVariants("outline", "lg")}>
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
              Delete Purchase
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this purchase?"
        description="This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
