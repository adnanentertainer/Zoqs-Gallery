import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

interface ProductWhatsAppButtonProps {
  product: Product;
}

export function ProductWhatsAppButton({
  product,
}: ProductWhatsAppButtonProps) {
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const message = `Hi! I'm interested in *${product.name}* (${formatPrice(
    product.price,
  )}).\n${productUrl}`;

  return (
    <WhatsAppFloatingButton
      message={message}
      ariaLabel={`Ask about ${product.name} on WhatsApp`}
    />
  );
}
