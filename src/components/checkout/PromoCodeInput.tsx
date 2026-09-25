"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { validatePromoCodeAction } from "@/app/checkout/actions";
import type { PromoValidationResult } from "@/types/promoCode";

export interface AppliedPromo {
  code: string;
  discountAmount: number;
}

interface PromoCodeInputProps {
  subtotal: number;
  email: string;
  appliedPromo: AppliedPromo | null;
  onApply: (promo: AppliedPromo) => void;
  onRemove: () => void;
  /** Pre-filled from a banner link's ?promo= param — see PromoBannerCarousel. */
  initialCode?: string;
}

export function PromoCodeInput({
  subtotal,
  email,
  appliedPromo,
  onApply,
  onRemove,
  initialCode = "",
}: PromoCodeInputProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A promo's discount is a snapshot taken when "Apply" was clicked. If the
  // cart changes afterward — e.g. the customer adjusts quantities in the
  // header's cart drawer without navigating away from checkout — without
  // re-applying the code, that snapshot goes stale — the preview would keep
  // showing the old discount/total against the new subtotal. Re-validate
  // whenever the subtotal moves so the preview stays honest; this never
  // writes anything and is cheap to call repeatedly (see
  // validatePromoCodeAction's own comment). The real charge at order time
  // is always recalculated from scratch regardless, so this only fixes what
  // the customer sees before submitting, not what they'd actually be
  // charged either way.
  useEffect(() => {
    if (!appliedPromo) return;
    let cancelled = false;
    const { code: promoCode, discountAmount: previousAmount } = appliedPromo;

    validatePromoCodeAction(promoCode, subtotal, email).then((result) => {
      if (cancelled) return;
      if (!result.valid || result.discountAmount === undefined) {
        onRemove();
        setError(
          result.error ?? "Your promo code no longer applies to this order.",
        );
        return;
      }
      if (result.discountAmount !== previousAmount) {
        onApply({
          code: result.code ?? promoCode,
          discountAmount: result.discountAmount,
        });
      }
    });

    return () => {
      cancelled = true;
    };
    // Deliberately reacting to `subtotal` alone — see the comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  async function handleApply() {
    if (isSubmitting || !code.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result: PromoValidationResult = await validatePromoCodeAction(
      code,
      subtotal,
      email,
    );

    setIsSubmitting(false);
    if (!result.valid || result.discountAmount === undefined) {
      setError(result.error ?? "Invalid or expired promo code.");
      return;
    }

    onApply({
      code: result.code ?? code.trim().toUpperCase(),
      discountAmount: result.discountAmount,
    });
  }

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm border border-success/30 bg-success/5 px-4 py-3">
        <div className="flex flex-col">
          <span className="font-body text-sm font-medium text-primary">
            Promo code {appliedPromo.code} applied
          </span>
          <span className="font-body text-xs text-success">
            You saved {formatPrice(appliedPromo.discountAmount)}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove promo code"
          className="rounded-sm p-1.5 text-muted transition-colors hover:bg-beige hover:text-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // A plain <div>, not a <form> — this renders inside CheckoutForm's own
  // <form>, and HTML doesn't allow nested <form> elements (it's also a
  // hydration error: the server's HTML parser silently closes the outer
  // form early when it hits a second <form> tag, so the DOM the browser
  // paints before hydration doesn't match what React renders after).
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    // Stop this from bubbling up and submitting the outer checkout form —
    // Enter here should only trigger Apply.
    event.preventDefault();
    handleApply();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Have a promo code?"
            placeholder="Enter promo code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          isLoading={isSubmitting}
          disabled={!code.trim()}
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}
