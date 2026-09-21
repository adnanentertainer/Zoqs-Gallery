"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import {
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
} from "@/lib/admin/datetimeLocal";
import {
  createPromoBannerAction,
  updatePromoBannerAction,
} from "@/app/admin/promo-banners/actions";
import type { AdminPromoBannerInput } from "@/types/promoBanner";

interface PromoBannerFormProps {
  mode: "create" | "edit";
  bannerId?: string;
  initialValues?: AdminPromoBannerInput;
  promoCodeOptions: { id: string; code: string }[];
}

function emptyBanner(): AdminPromoBannerInput {
  return {
    title: "",
    subtitle: "",
    promoText: "",
    promoCodeId: null,
    buttonText: "",
    buttonLink: "",
    bannerImageUrl: "",
    backgroundImageUrl: "",
    startsAt: null,
    endsAt: null,
    isActive: true,
    displayOrder: 0,
  };
}

export function PromoBannerForm({
  mode,
  bannerId,
  initialValues,
  promoCodeOptions,
}: PromoBannerFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminPromoBannerInput>(
    initialValues ?? emptyBanner(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof AdminPromoBannerInput>(
    key: K,
    value: AdminPromoBannerInput[K],
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
        ? await createPromoBannerAction(values)
        : await updatePromoBannerAction(bannerId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/promo-banners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        <Input
          label="Banner Title"
          required
          className="sm:col-span-2"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="10% OFF YOUR FIRST ORDER"
        />
        <Input
          label="Subtitle / Description (optional)"
          className="sm:col-span-2"
          value={values.subtitle}
          onChange={(event) => update("subtitle", event.target.value)}
        />
        <Input
          label="Promotional Text (optional)"
          value={values.promoText}
          onChange={(event) => update("promoText", event.target.value)}
          placeholder="Limited time offer"
        />
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Linked Promo Code (optional)
          </label>
          <select
            value={values.promoCodeId ?? ""}
            onChange={(event) =>
              update("promoCodeId", event.target.value || null)
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">None</option>
            {promoCodeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.code}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Button Text (optional)"
          value={values.buttonText}
          onChange={(event) => update("buttonText", event.target.value)}
          placeholder="Shop Now"
        />
        <Input
          label="Button Link (optional)"
          value={values.buttonLink}
          onChange={(event) => update("buttonLink", event.target.value)}
          placeholder="/shop"
        />
        <Input
          label="Banner Image URL (optional)"
          className="sm:col-span-2"
          value={values.bannerImageUrl}
          onChange={(event) => update("bannerImageUrl", event.target.value)}
        />
        <Input
          label="Background Image URL (optional)"
          className="sm:col-span-2"
          value={values.backgroundImageUrl}
          onChange={(event) =>
            update("backgroundImageUrl", event.target.value)
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
          label="End Date & Time (optional)"
          type="datetime-local"
          value={toDatetimeLocalValue(values.endsAt)}
          onChange={(event) =>
            update("endsAt", fromDatetimeLocalValue(event.target.value))
          }
        />
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
          Active (visible on the homepage)
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
        >
          {mode === "create" ? "Create Banner" : "Save Changes"}
        </Button>
        <Link
          href="/admin/promo-banners"
          className={buttonVariants("outline", "lg")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
