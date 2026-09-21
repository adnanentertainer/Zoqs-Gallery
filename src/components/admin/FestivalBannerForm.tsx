"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateAdminFestivalBannerAction } from "@/app/admin/settings/actions";
import {
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
} from "@/lib/admin/datetimeLocal";
import type { FestivalBanner } from "@/types/festivalBanner";

export function FestivalBannerForm({
  initialValues,
}: {
  initialValues: FestivalBanner;
}) {
  const [values, setValues] = useState<FestivalBanner>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FestivalBanner>(
    key: K,
    value: FestivalBanner[K],
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

    const result = await updateAdminFestivalBannerAction(values);

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
        <AuthMessage variant="success" message="Festival banner saved." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Festival Name"
          placeholder="Eid-ul-Fitr Sale"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <Input
          label="Countdown Message"
          placeholder="Sale starts in"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
        />
        <Input
          label="Target Date & Time"
          type="datetime-local"
          value={toDatetimeLocalValue(values.targetAt)}
          onChange={(event) =>
            update("targetAt", fromDatetimeLocalValue(event.target.value))
          }
        />
        <div />
        <Input
          label="Button Label (optional)"
          placeholder="Shop Now"
          value={values.ctaLabel}
          onChange={(event) => update("ctaLabel", event.target.value)}
        />
        <Input
          label="Button Link (optional)"
          placeholder="/shop"
          value={values.ctaHref}
          onChange={(event) => update("ctaHref", event.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => update("isActive", event.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        Show this banner on the storefront
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSubmitting}
      >
        Save Festival Banner
      </Button>
    </form>
  );
}
