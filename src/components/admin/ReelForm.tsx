"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { createReelAction } from "@/app/admin/reels/actions";
import type { ReelProductOption } from "@/types/admin";

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";
const fieldLabelStyles = "font-body text-sm font-medium text-primary";

interface ReelFormProps {
  products: ReelProductOption[];
}

export function ReelForm({ products }: ReelFormProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productId, setProductId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      const key = product.categoryId ?? product.categoryName;
      if (!seen.has(key)) seen.set(key, product.categoryName);
    }
    return Array.from(seen, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (!categoryFilter) return products;
    return products.filter(
      (product) => (product.categoryId ?? product.categoryName) === categoryFilter,
    );
  }, [products, categoryFilter]);

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    const stillVisible = products.some(
      (product) =>
        product.id === productId &&
        (!value || (product.categoryId ?? product.categoryName) === value),
    );
    if (!stillVisible) setProductId("");
  }

  function handleProductChange(id: string) {
    setProductId(id);
    const selected = products.find((product) => product.id === id);
    setCaption(selected?.defaultCaption ?? "");
  }

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
          <label className={fieldLabelStyles}>Category</label>
          <select
            value={categoryFilter}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className={selectStyles}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="font-body text-xs text-muted">
            Narrow the product list below by category.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Product</label>
          <select
            required
            value={productId}
            onChange={(event) => handleProductChange(event.target.value)}
            className={selectStyles}
          >
            <option value="" disabled>
              Select a product
            </option>
            {categories
              .filter((category) => !categoryFilter || category.id === categoryFilter)
              .map((category) => (
                <optgroup key={category.id} label={category.name}>
                  {visibleProducts
                    .filter(
                      (product) => (product.categoryId ?? product.categoryName) === category.id,
                    )
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </optgroup>
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
            rows={9}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="font-body text-xs text-muted">
            Auto-filled from the selected product&apos;s name, description,
            price, and link — edit if you want, but nothing needs to be typed
            by hand. Posted as-is to both Facebook and Instagram.
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
