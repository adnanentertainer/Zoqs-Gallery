"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { updateAdminStoreSettingsAction } from "@/app/admin/settings/actions";
import type { AdminStoreSettings } from "@/lib/services/admin/adminSettingsService";

export function SettingsForm({
  initialValues,
}: {
  initialValues: AdminStoreSettings;
}) {
  const [values, setValues] = useState<AdminStoreSettings>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof AdminStoreSettings>(
    key: K,
    value: AdminStoreSettings[K],
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

    const result = await updateAdminStoreSettingsAction(values);

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
      {success && <AuthMessage variant="success" message="Settings saved." />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Store Name"
          required
          value={values.siteName}
          onChange={(event) => update("siteName", event.target.value)}
        />
        <Input
          label="Currency"
          required
          value={values.currency}
          onChange={(event) => update("currency", event.target.value)}
        />
        <Input
          label="Country"
          required
          value={values.country}
          onChange={(event) => update("country", event.target.value)}
        />
        <Input
          label="Free Shipping Threshold (PKR)"
          type="number"
          min={0}
          required
          value={values.freeShippingThreshold}
          onChange={(event) =>
            update("freeShippingThreshold", Number(event.target.value))
          }
        />
        <Input
          label="Flat Shipping Cost (PKR)"
          type="number"
          min={0}
          required
          value={values.flatShippingCost}
          onChange={(event) =>
            update("flatShippingCost", Number(event.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 font-body text-sm text-primary">
          <input
            type="checkbox"
            checked={values.freeShippingEnabledNormalOrders}
            onChange={(event) =>
              update("freeShippingEnabledNormalOrders", event.target.checked)
            }
            className="h-4 w-4 accent-gold"
          />
          Enable free shipping for normal orders
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-primary">
          <input
            type="checkbox"
            checked={values.freeShippingEnabledOffers}
            onChange={(event) =>
              update("freeShippingEnabledOffers", event.target.checked)
            }
            className="h-4 w-4 accent-gold"
          />
          Enable free shipping during offers (Blessed Friday / promo codes)
        </label>
        <p className="font-body text-xs text-muted">
          Each toggle controls whether the free shipping threshold above
          applies in that context, independently of the other. When off, the
          flat shipping cost is always charged instead.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-fit"
        isLoading={isSubmitting}
      >
        Save Settings
      </Button>
    </form>
  );
}
