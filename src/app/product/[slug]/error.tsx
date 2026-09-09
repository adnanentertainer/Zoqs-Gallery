"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function ProductError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError
        title="Unable to load this product"
        description="Something went wrong while loading this product. Please try again."
        onRetry={retry}
      />
    </Container>
  );
}
