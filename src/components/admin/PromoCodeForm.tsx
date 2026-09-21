"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
} from "@/lib/admin/datetimeLocal";
import {
  createPromoCodeAction,
  deletePromoCodeAction,
  updatePromoCodeAction,
} from "@/app/admin/promo-codes/actions";
import type { AdminPromoCodeInput } from "@/types/promoCode";

interface PromoCodeFormProps {
  mode: "create" | "edit";
  promoCodeId?: string;
  initialValues?: AdminPromoCodeInput;
}

function emptyPromoCode(): AdminPromoCodeInput {
  return {
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: null,
    maxDiscountAmount: null,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    usageLimitPerCustomer: null,
    isActive: true,
    description: "",
  };
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PromoCodeForm({
  mode,
  promoCodeId,
  initialValues,
}: PromoCodeFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminPromoCodeInput>(
    initialValues ?? emptyPromoCode(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function update<K extends keyof AdminPromoCodeInput>(
    key: K,
    value: AdminPromoCodeInput[K],
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
        ? await createPromoCodeAction(values)
        : await updatePromoCodeAction(promoCodeId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/promo-codes");
    router.refresh();
  }

  async function handleDelete() {
    if (!promoCodeId) return;
    setIsDeleting(true);
    const result = await deletePromoCodeAction(promoCodeId);
    setIsDeleting(false);
    setConfirmDelete(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/promo-codes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        <Input
          label="Promo Code"
          required
          value={values.code}
          onChange={(event) => update("code", event.target.value.toUpperCase())}
          placeholder="WELCOME10"
        />
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Discount Type
          </label>
          <select
            value={values.discountType}
            onChange={(event) =>
              update(
                "discountType",
                event.target.value as AdminPromoCodeInput["discountType"],
              )
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (Rs.)</option>
          </select>
        </div>
        <Input
          label={
            values.discountType === "percentage"
              ? "Discount Value (%)"
              : "Discount Value (Rs.)"
          }
          required
          type="number"
          min={1}
          max={values.discountType === "percentage" ? 100 : undefined}
          value={values.discountValue}
          onChange={(event) =>
            update("discountValue", Number(event.target.value))
          }
        />
        {values.discountType === "percentage" && (
          <Input
            label="Maximum Discount Amount (Rs., optional)"
            type="number"
            min={0}
            value={values.maxDiscountAmount ?? ""}
            onChange={(event) =>
              update("maxDiscountAmount", toNumberOrNull(event.target.value))
            }
          />
        )}
        <Input
          label="Minimum Order Amount (Rs., optional)"
          type="number"
          min={0}
          value={values.minOrderAmount ?? ""}
          onChange={(event) =>
            update("minOrderAmount", toNumberOrNull(event.target.value))
          }
        />
        <Input
          label="Start Date & Time (optional)"
          type="datetime-local"
          value={toDatetimeLocalValue(values.startsAt)}
          onChange={(event) =>
            update("startsAt", fromDatetimeLocalValue(event.target.value))
          }
        />
        <Input
          label="Expiry Date & Time (optional)"
          type="datetime-local"
          value={toDatetimeLocalValue(values.expiresAt)}
          onChange={(event) =>
            update("expiresAt", fromDatetimeLocalValue(event.target.value))
          }
        />
        <Input
          label="Usage Limit (total, optional)"
          type="number"
          min={1}
          value={values.usageLimit ?? ""}
          onChange={(event) =>
            update("usageLimit", toNumberOrNull(event.target.value))
          }
        />
        <Input
          label="Usage Limit Per Customer (optional)"
          type="number"
          min={1}
          value={values.usageLimitPerCustomer ?? ""}
          onChange={(event) =>
            update(
              "usageLimitPerCustomer",
              toNumberOrNull(event.target.value),
            )
          }
        />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-sm font-medium text-primary">
            Description / Internal Notes (optional)
          </label>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <label className="flex items-center gap-2 font-body text-sm text-primary">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Active (customers can use this code)
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
            {mode === "create" ? "Create Promo Code" : "Save Changes"}
          </Button>
          <Link
            href="/admin/promo-codes"
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
            Delete Promo Code
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this promo code?"
        description="This cannot be undone. Orders that already used this code keep their own record of the discount, so deleting it is safe."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  );
}
