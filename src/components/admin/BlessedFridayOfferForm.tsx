"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateAdminBlessedFridayOfferAction } from "@/app/admin/settings/actions";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";

export function BlessedFridayOfferForm({
  initialValues,
}: {
  initialValues: BlessedFridayOffer;
}) {
  const [values, setValues] = useState<BlessedFridayOffer>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof BlessedFridayOffer>(
    key: K,
    value: BlessedFridayOffer[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminBlessedFridayOfferAction(values);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-2xl flex-col gap-4 rounded-sm border border-beige bg-white p-6"
    >
      {error && <AuthMessage variant="error" message={error} />}
      {success && (
        <AuthMessage
          variant="success"
          message="Blessed Friday offer saved."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Discount Percentage (%)"
          type="number"
          min={1}
          max={100}
          required
          value={values.discountPercentage}
          onChange={(event) =>
            update("discountPercentage", Number(event.target.value))
          }
        />
        <Input
          label="Minimum Spend (PKR)"
          type="number"
          min={0}
          required
          value={values.minSpend}
          onChange={(event) => update("minSpend", Number(event.target.value))}
        />
      </div>

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={values.enabled}
          onChange={(event) => update("enabled", event.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Enable the Blessed Friday offer on the storefront
      </label>
      <p className="font-body text-xs text-muted">
        While enabled, this discount is applied automatically at checkout —
        no promo code needed — on any order above the minimum spend, and the
        evergreen free-shipping threshold is suspended in favor of it.
      </p>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSubmitting}
      >
        Save Blessed Friday Offer
      </Button>
    </form>
  );
}
