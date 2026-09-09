import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export interface CheckoutItemData {
  key: string;
  imageUrl: string | null;
  name: string;
  variantLabel?: string | null;
  quantity: number;
  lineTotal: number;
}

export function CheckoutItem({ item }: { item: CheckoutItemData }) {
  return (
    <div className="flex gap-3 border-b border-beige py-3 last:border-b-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-beige">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 font-body text-sm font-medium text-primary">
          {item.name}
        </span>
        {item.variantLabel && (
          <span className="font-body text-xs text-muted">
            {item.variantLabel}
          </span>
        )}
        <span className="font-body text-xs text-muted">
          Qty {item.quantity}
        </span>
      </div>
      <span className="shrink-0 font-body text-sm font-medium text-primary">
        {formatPrice(item.lineTotal)}
      </span>
    </div>
  );
}
