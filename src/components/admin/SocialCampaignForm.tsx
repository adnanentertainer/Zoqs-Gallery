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
  createSocialCampaignAction,
  updateSocialCampaignAction,
} from "@/app/admin/social-campaigns/actions";
import type { AdminSocialCampaignInput } from "@/types/socialCampaign";

interface SocialCampaignFormProps {
  mode: "create" | "edit";
  campaignId?: string;
  initialValues?: AdminSocialCampaignInput;
}

function emptyCampaign(): AdminSocialCampaignInput {
  return {
    name: "",
    description: "",
    facebookPageId: "",
    instagramAccountId: "",
    engagementType: "both",
    requiredEngagementCount: 20,
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: null,
    maxDiscountAmount: 1000,
    couponValidityDays: 30,
    startsAt: null,
    endsAt: null,
    maxTotalClaims: null,
    maxClaimsPerCustomer: 1,
    allowRepeatClaims: false,
    status: "draft",
  };
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SocialCampaignForm({
  mode,
  campaignId,
  initialValues,
}: SocialCampaignFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminSocialCampaignInput>(
    initialValues ?? emptyCampaign(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof AdminSocialCampaignInput>(
    key: K,
    value: AdminSocialCampaignInput[K],
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
        ? await createSocialCampaignAction(values)
        : await updateSocialCampaignAction(campaignId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (mode === "create" && "id" in result && result.id) {
      router.push(`/admin/social-campaigns/${result.id}`);
    } else {
      router.push("/admin/social-campaigns");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6 sm:grid-cols-2">
        <Input
          label="Campaign Name"
          required
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Share &amp; Like 20 Zoqs Gallery Posts"
          className="sm:col-span-2"
        />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="font-body text-sm font-medium text-primary">
            Description (optional)
          </label>
          <textarea
            rows={2}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <Input
          label="Facebook Page ID (optional, reference only)"
          value={values.facebookPageId}
          onChange={(event) => update("facebookPageId", event.target.value)}
        />
        <Input
          label="Instagram Account ID (optional, reference only)"
          value={values.instagramAccountId}
          onChange={(event) => update("instagramAccountId", event.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Engagement Type
          </label>
          <select
            value={values.engagementType}
            onChange={(event) =>
              update(
                "engagementType",
                event.target.value as AdminSocialCampaignInput["engagementType"],
              )
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="like">Like only</option>
            <option value="share">Share only</option>
            <option value="both">Like or Share</option>
          </select>
        </div>
        <Input
          label="Required Engagement Count"
          required
          type="number"
          min={1}
          value={values.requiredEngagementCount}
          onChange={(event) =>
            update("requiredEngagementCount", Number(event.target.value))
          }
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
                event.target.value as AdminSocialCampaignInput["discountType"],
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
          onChange={(event) => update("discountValue", Number(event.target.value))}
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
          label="Minimum Order Value (Rs., optional)"
          type="number"
          min={0}
          value={values.minOrderAmount ?? ""}
          onChange={(event) =>
            update("minOrderAmount", toNumberOrNull(event.target.value))
          }
        />
        <Input
          label="Coupon Validity (days after approval)"
          required
          type="number"
          min={1}
          value={values.couponValidityDays}
          onChange={(event) =>
            update("couponValidityDays", Number(event.target.value))
          }
        />

        <Input
          label="Campaign Start Date &amp; Time (optional)"
          type="datetime-local"
          value={toDatetimeLocalValue(values.startsAt)}
          onChange={(event) =>
            update("startsAt", fromDatetimeLocalValue(event.target.value))
          }
        />
        <Input
          label="Campaign End Date &amp; Time (optional)"
          type="datetime-local"
          value={toDatetimeLocalValue(values.endsAt)}
          onChange={(event) =>
            update("endsAt", fromDatetimeLocalValue(event.target.value))
          }
        />

        <Input
          label="Max Total Customers Who Can Claim (optional)"
          type="number"
          min={1}
          value={values.maxTotalClaims ?? ""}
          onChange={(event) =>
            update("maxTotalClaims", toNumberOrNull(event.target.value))
          }
        />
        <Input
          label="Max Claims Per Customer"
          required
          type="number"
          min={1}
          value={values.maxClaimsPerCustomer}
          onChange={(event) =>
            update("maxClaimsPerCustomer", Number(event.target.value))
          }
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Status
          </label>
          <select
            value={values.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value as AdminSocialCampaignInput["status"],
              )
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end font-body text-sm text-primary">
          <input
            type="checkbox"
            checked={values.allowRepeatClaims}
            onChange={(event) => update("allowRepeatClaims", event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Allow each customer to claim more than once
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
            {mode === "create" ? "Create Campaign" : "Save Changes"}
          </Button>
          <Link
            href="/admin/social-campaigns"
            className={buttonVariants("outline", "lg")}
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
