"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateAdminSaleOfferAction } from "@/app/admin/settings/actions";
import type { SaleOffer } from "@/types/saleOffer";

export function SaleOfferForm({
  initialValues,
}: {
  initialValues: SaleOffer;
}) {
  const [values, setValues] = useState<SaleOffer>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof SaleOffer>(key: K, value: SaleOffer[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminSaleOfferAction(values);

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
      {success && <AuthMessage variant="success" message="Sale saved." />}

      <Input
        label="Sale Name (optional)"
        placeholder="e.g. 11.11 Mega Sale"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
      />

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
          label="Minimum Order Value (PKR)"
          type="number"
          min={0}
          required
          value={values.minSpend}
          onChange={(event) => update("minSpend", Number(event.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Start Date (optional)"
          type="date"
          value={values.startDate ?? ""}
          onChange={(event) =>
            update("startDate", event.target.value || null)
          }
        />
        <Input
          label="End Date (optional)"
          type="date"
          value={values.endDate ?? ""}
          onChange={(event) => update("endDate", event.target.value || null)}
        />
      </div>
      <p className="font-body text-xs text-muted">
        Leave both dates blank for an always-on-when-enabled sale, or set a
        date range (e.g. Nov 11 to Nov 12) in advance — the sale only
        actually runs inside that window, so you can schedule it ahead of
        time and flip &quot;Enabled&quot; on whenever you&apos;re ready
        without it running early or overstaying.
      </p>

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={values.enabled}
          onChange={(event) => update("enabled", event.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Enable the Sale on the storefront
      </label>
      <p className="font-body text-xs text-muted">
        Like the Blessed Friday offer, this is an automatic discount applied
        at checkout — no promo code needed — on any order above the minimum
        order value. Whenever the Sale is active, it takes priority over the
        Blessed Friday offer below (only one automatic discount ever applies
        at a time); Blessed Friday resumes normally once the Sale ends or is
        turned off.
      </p>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSubmitting}
      >
        Save Sale
      </Button>
    </form>
  );
}
