"use client";

import { Container } from "@/components/ui/Container";
import { ProductGridError } from "@/components/product/ProductGridError";

export default function CategoryError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-16">
      <ProductGridError onRetry={retry} />
    </Container>
  );
}
