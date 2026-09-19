"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { createReelAction } from "@/app/admin/reels/actions";
import type { ProductOption } from "@/types/admin";

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";
const fieldLabelStyles = "font-body text-sm font-medium text-primary";

interface ReelFormProps {
  products: ProductOption[];
}

export function ReelForm({ products }: ReelFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const result = await createReelAction({ productId, videoUrl, caption });

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/reels");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <div className="grid grid-cols-1 gap-4 rounded-sm border border-beige bg-white p-6">
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Product</label>
          <select
            required
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className={selectStyles}
          >
            <option value="" disabled>
              Select a product
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            label="Video URL"
            required
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://..."
          />
          <p className="font-body text-xs text-muted">
            Link to the finished Reel video (e.g. exported from CapCut/Canva
            and uploaded to storage). This app publishes the video as-is --
            it doesn&apos;t generate or edit it.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Caption</label>
          <textarea
            required
            rows={4}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="font-body text-xs text-muted">
            Posted as-is to both Facebook and Instagram.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          Publish Reel
        </Button>
        <Link href="/admin/reels" className={buttonVariants("outline", "lg")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
