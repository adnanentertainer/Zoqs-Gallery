"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { slugify } from "@/lib/admin/slug";
import {
  createProductAction,
  deleteProductAction,
  setProductActiveAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import type {
  AdminCategoryListItem,
  AdminProductInput,
  SupplierOption,
} from "@/types/admin";
import Link from "next/link";

const MATERIALS = [
  "Artificial Gold",
  "Kundan",
  "Pearl",
  "Crystal",
  "Stainless Steel",
  "Alloy",
];
const COLORS = ["Gold", "Silver", "Rose Gold", "Pearl", "Multicolor", "Black"];
const OCCASIONS = ["Everyday", "Party", "Wedding", "Bridal", "Festive", "Gift"];
const VARIANT_TYPES = ["color", "size", "style"] as const;

function emptyProduct(): AdminProductInput {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    price: 0,
    originalPrice: null,
    stock: 0,
    material: MATERIALS[0],
    color: COLORS[0],
    occasion: OCCASIONS[0],
    isActive: true,
    isFeatured: false,
    images: [],
    variants: [],
    sku: "",
    costPrice: null,
    minStockLevel: 5,
    maxStockLevel: null,
    forceUnavailable: false,
    primarySupplierId: null,
  };
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: AdminProductInput;
  hasOrderHistory?: boolean;
  categories: AdminCategoryListItem[];
  suppliers: SupplierOption[];
}

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";
const fieldLabelStyles = "font-body text-sm font-medium text-primary";
const sectionStyles =
  "flex flex-col gap-4 rounded-sm border border-beige bg-white p-6";

export function ProductForm({
  mode,
  productId,
  initialValues,
  hasOrderHistory = false,
  categories,
  suppliers,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AdminProductInput>(
    initialValues ?? emptyProduct(),
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "deactivate" | null
  >(null);
  const [isMutating, setIsMutating] = useState(false);

  function update<K extends keyof AdminProductInput>(
    key: K,
    value: AdminProductInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) update("slug", slugify(name));
  }

  function addImage() {
    update("images", [...values.images, { imageUrl: "", altText: "" }]);
  }
  function removeImage(index: number) {
    update(
      "images",
      values.images.filter((_, i) => i !== index),
    );
  }
  function updateImage(
    index: number,
    field: "imageUrl" | "altText",
    value: string,
  ) {
    update(
      "images",
      values.images.map((image, i) =>
        i === index ? { ...image, [field]: value } : image,
      ),
    );
  }

  function addVariant() {
    update("variants", [
      ...values.variants,
      {
        optionType: "color",
        optionValue: "",
        priceAdjustment: null,
        stock: null,
        sku: "",
        isActive: true,
      },
    ]);
  }
  function removeVariant(index: number) {
    update(
      "variants",
      values.variants.filter((_, i) => i !== index),
    );
  }
  function updateVariant<K extends keyof AdminProductInput["variants"][number]>(
    index: number,
    field: K,
    value: AdminProductInput["variants"][number][K],
  ) {
    update(
      "variants",
      values.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);

    const result =
      mode === "create"
        ? await createProductAction(values)
        : await updateProductAction(productId!, values);

    setIsSubmitting(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function handleConfirmedAction() {
    if (!productId || !confirmAction) return;
    setIsMutating(true);
    const result =
      confirmAction === "delete"
        ? await deleteProductAction(productId)
        : await setProductActiveAction(productId, false);
    setIsMutating(false);
    setConfirmAction(null);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <AuthMessage variant="error" message={formError} />}

      <section className={sectionStyles}>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Product Name"
            required
            value={values.name}
            onChange={(event) => handleNameChange(event.target.value)}
          />
          <Input
            label="Slug"
            required
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              update("slug", event.target.value);
            }}
          />
          <Input
            label="Short Description"
            className="sm:col-span-2"
            value={values.shortDescription}
            onChange={(event) => update("shortDescription", event.target.value)}
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className={fieldLabelStyles}>Full Description</label>
            <textarea
              required
              rows={4}
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Category</label>
            <select
              required
              value={values.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              className={selectStyles}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Material</label>
            <select
              value={values.material}
              onChange={(event) => update("material", event.target.value)}
              className={selectStyles}
            >
              {MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Color</label>
            <select
              value={values.color}
              onChange={(event) => update("color", event.target.value)}
              className={selectStyles}
            >
              {COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Occasion</label>
            <select
              value={values.occasion}
              onChange={(event) => update("occasion", event.target.value)}
              className={selectStyles}
            >
              {OCCASIONS.map((occasion) => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionStyles}>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Pricing &amp; Inventory
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Price (PKR)"
            type="number"
            min={0}
            required
            value={values.price}
            onChange={(event) => update("price", Number(event.target.value))}
          />
          <Input
            label="Compare At Price (optional)"
            type="number"
            min={0}
            value={values.originalPrice ?? ""}
            onChange={(event) =>
              update(
                "originalPrice",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            required
            value={values.stock}
            onChange={(event) => update("stock", Number(event.target.value))}
          />
          <Input
            label="Cost Price (PKR, optional)"
            type="number"
            min={0}
            value={values.costPrice ?? ""}
            onChange={(event) =>
              update(
                "costPrice",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
          <Input
            label="SKU / Product ID"
            placeholder="Auto-generated if left blank"
            value={values.sku}
            onChange={(event) => update("sku", event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Supplier (optional)</label>
            <select
              value={values.primarySupplierId ?? ""}
              onChange={(event) =>
                update("primarySupplierId", event.target.value || null)
              }
              className={selectStyles}
            >
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.status === "inactive" ? " (Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Minimum Stock Level"
            type="number"
            min={0}
            required
            value={values.minStockLevel}
            onChange={(event) =>
              update("minStockLevel", Number(event.target.value))
            }
          />
          <Input
            label="Maximum Stock Level (optional)"
            type="number"
            min={0}
            value={values.maxStockLevel ?? ""}
            onChange={(event) =>
              update(
                "maxStockLevel",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 font-body text-sm text-primary">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => update("isActive", event.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Active (visible in the shop)
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-primary">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(event) => update("isFeatured", event.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-primary">
            <input
              type="checkbox"
              checked={values.forceUnavailable}
              onChange={(event) =>
                update("forceUnavailable", event.target.checked)
              }
              className="h-4 w-4 accent-gold"
            />
            Force Unavailable (stays visible, blocks purchase, stock untouched)
          </label>
        </div>
      </section>

      <section className={sectionStyles}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Images
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Image
          </Button>
        </div>
        {values.images.length === 0 && (
          <p className="font-body text-sm text-muted">No images yet.</p>
        )}
        {values.images.map((image, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              label={index === 0 ? "Image URL" : undefined}
              placeholder="https://…"
              value={image.imageUrl}
              onChange={(event) =>
                updateImage(index, "imageUrl", event.target.value)
              }
            />
            <Input
              label={index === 0 ? "Alt Text" : undefined}
              value={image.altText}
              onChange={(event) =>
                updateImage(index, "altText", event.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              aria-label={`Remove image ${index + 1}`}
              className="flex h-11 items-center justify-center rounded-sm border border-beige px-3 text-error hover:border-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <p className="font-body text-xs text-muted">
          The first image is used as the primary product image. Paste any public
          image URL — there is no file upload in this phase.
        </p>
      </section>

      <section className={sectionStyles}>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Variants
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Variant
          </Button>
        </div>
        {values.variants.length === 0 && (
          <p className="font-body text-sm text-muted">
            No variants — this product will sell as a single option.
          </p>
        )}
        {values.variants.map((variant, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-3 border-b border-beige pb-4 last:border-b-0 sm:grid-cols-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelStyles}>Type</label>
              <select
                value={variant.optionType}
                onChange={(event) =>
                  updateVariant(
                    index,
                    "optionType",
                    event.target.value as (typeof VARIANT_TYPES)[number],
                  )
                }
                className={selectStyles}
              >
                {VARIANT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type[0].toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Value"
              placeholder="Gold"
              value={variant.optionValue}
              onChange={(event) =>
                updateVariant(index, "optionValue", event.target.value)
              }
            />
            <Input
              label="Price Adj."
              type="number"
              placeholder="0"
              value={variant.priceAdjustment ?? ""}
              onChange={(event) =>
                updateVariant(
                  index,
                  "priceAdjustment",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
            <Input
              label="Stock"
              type="number"
              min={0}
              placeholder="Same as product"
              value={variant.stock ?? ""}
              onChange={(event) =>
                updateVariant(
                  index,
                  "stock",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
            <Input
              label="SKU"
              value={variant.sku}
              onChange={(event) =>
                updateVariant(index, "sku", event.target.value)
              }
            />
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 font-body text-sm text-primary">
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(event) =>
                    updateVariant(index, "isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-gold"
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                aria-label={`Remove variant ${index + 1}`}
                className="flex h-9 items-center justify-center rounded-sm border border-beige px-2 text-error hover:border-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
          >
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
          <Link
            href="/admin/products"
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
            onClick={() =>
              setConfirmAction(hasOrderHistory ? "deactivate" : "delete")
            }
          >
            {hasOrderHistory ? "Deactivate Product" : "Delete Product"}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "delete"
            ? "Delete this product?"
            : "Deactivate this product?"
        }
        description={
          confirmAction === "delete"
            ? "This permanently removes the product, its images, and its variants. This cannot be undone."
            : "This product has order history, so it can't be permanently deleted — deactivating hides it from the shop while keeping past orders intact."
        }
        confirmLabel={confirmAction === "delete" ? "Delete" : "Deactivate"}
        isLoading={isMutating}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </form>
  );
}
