import { formatPrice } from "@/lib/utils";
import type { FreeShippingProgress } from "@/lib/cart";

interface ShippingProgressProps {
  progress: FreeShippingProgress;
}

export function ShippingProgress({ progress }: ShippingProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm text-primary">
        {progress.qualifies ? (
          <span className="font-medium text-success">
            You&apos;ve unlocked free shipping
          </span>
        ) : (
          <>
            You&apos;re{" "}
            <span className="font-semibold text-gold">
              {formatPrice(progress.remaining)}
            </span>{" "}
            away from free shipping
          </>
        )}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-beige">
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
