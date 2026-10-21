"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateAdminWeddingPromotionAction } from "@/app/admin/settings/actions";
import type { WeddingPromotionSettings } from "@/types/weddingPromotion";

export function WeddingPromotionForm({
  initialValues,
}: {
  initialValues: WeddingPromotionSettings;
}) {
  const [values, setValues] = useState<WeddingPromotionSettings>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminWeddingPromotionAction(values);

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
        <AuthMessage variant="success" message="Wedding promotion saved." />
      )}

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={values.enabled}
          onChange={(event) => {
            setValues({ enabled: event.target.checked });
            setSuccess(false);
          }}
          className="h-4 w-4 accent-gold"
        />
        Show the Wedding Edit banner and Wedding Season Favourites on the
        homepage
      </label>
      <p className="font-body text-xs text-muted">
        The /wedding-collection page and its &quot;Wedding Collection&quot;
        navigation link stay live either way — this only controls the homepage
        promotion. Choose which products appear from Admin → Products → each
        product&apos;s Wedding Collection section.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-fit"
          isLoading={isSubmitting}
        >
          Save Wedding Promotion
        </Button>
        <Link
          href="/admin/products?wedding=1"
          className={buttonVariants("outline", "lg")}
        >
          Manage Wedding Pick Products
        </Link>
      </div>
    </form>
  );
}
