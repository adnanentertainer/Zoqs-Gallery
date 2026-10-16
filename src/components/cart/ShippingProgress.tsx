import { formatPrice } from "@/lib/utils";
import type { FreeShippingProgress } from "@/lib/cart";

interface ShippingProgressProps {
  progress: FreeShippingProgress;
  /** While the Blessed Friday offer is enabled, the evergreen free-shipping
   * perk is suspended store-wide (see CartContext/layout.tsx), so this
   * message would otherwise claim an unreachable threshold — hide it
   * entirely rather than show "away from free shipping" nonsense. */
  hidden?: boolean;
}

export function ShippingProgress({ progress, hidden }: ShippingProgressProps) {
  if (hidden) return null;

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
            away from free shipping — otherwise{" "}
            <span className="font-semibold text-primary">
              {formatPrice(progress.shippingCost)}
            </span>{" "}
            shipping applies
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
