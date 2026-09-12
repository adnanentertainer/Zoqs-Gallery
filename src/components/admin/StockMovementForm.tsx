"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { recordStockMovementAction } from "@/app/admin/inventory/movements/actions";
import { MOVEMENT_TYPE_OPTIONS } from "@/lib/admin/movementTypes";
import type { MovementType, ProductOption } from "@/types/admin";

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold";
const fieldLabelStyles = "font-body text-sm font-medium text-primary";

// "adjustment" alone doesn't imply a direction — a correction can go either
// way — so it's the only type that shows the increase/decrease choice.
// Every other type has one fixed, unambiguous direction.
const FIXED_DIRECTIONS: Partial<Record<MovementType, "increase" | "decrease">> = {
  stock_in: "increase",
  return: "increase",
  purchase: "increase",
  stock_out: "decrease",
  sale: "decrease",
  damaged: "decrease",
};

interface StockMovementFormProps {
  products: ProductOption[];
}

export function StockMovementForm({ products }: StockMovementFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState<string>("");
  const [movementType, setMovementType] = useState<MovementType>("stock_in");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId],
  );
  const fixedDirection = FIXED_DIRECTIONS[movementType];
  const effectiveDirection = fixedDirection ?? direction;

  function currentStockLabel(): string | null {
    if (!selectedProduct) return null;
    if (variantId) {
      const variant = selectedProduct.variants.find((v) => v.id === variantId);
      return variant?.stock === null || variant?.stock === undefined
        ? null
        : `Current stock: ${variant.stock}`;
    }
    return `Current stock: ${selectedProduct.stock}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await recordStockMovementAction({
      productId,
      variantId: variantId || null,
      movementType,
      direction: effectiveDirection,
      quantity,
      reason,
      referenceNumber,
    });

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Stock movement recorded.");
    setQuantity(1);
    setReason("");
    setReferenceNumber("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6"
    >
      <h2 className="font-heading text-lg font-semibold text-primary">
        Record Stock Movement
      </h2>
      {error && <AuthMessage variant="error" message={error} />}
      {success && <AuthMessage variant="success" message={success} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Product</label>
          <select
            required
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              setVariantId("");
            }}
            className={selectStyles}
          >
            <option value="" disabled>
              Select a product
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.sku ? ` (${product.sku})` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && selectedProduct.variants.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Variant</label>
            <select
              value={variantId}
              onChange={(event) => setVariantId(event.target.value)}
              className={selectStyles}
            >
              <option value="">Base product (no variant)</option>
              {selectedProduct.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                  {variant.sku ? ` (${variant.sku})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelStyles}>Movement Type</label>
          <select
            value={movementType}
            onChange={(event) =>
              setMovementType(event.target.value as MovementType)
            }
            className={selectStyles}
          >
            {MOVEMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {!fixedDirection && (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabelStyles}>Direction</label>
            <select
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as "increase" | "decrease")
              }
              className={selectStyles}
            >
              <option value="increase">Increase (+)</option>
              <option value="decrease">Decrease (-)</option>
            </select>
          </div>
        )}

        <Input
          label="Quantity"
          type="number"
          min={1}
          required
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
        <Input
          label="Reason (optional)"
          placeholder="e.g. New supplier delivery"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <Input
          label="Reference Number (optional)"
          placeholder="e.g. PO-20260912-0001"
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
        />
      </div>

      {currentStockLabel() && (
        <p className="font-body text-sm text-muted">{currentStockLabel()}</p>
      )}

      <div>
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          Record Movement
        </Button>
      </div>
    </form>
  );
}
