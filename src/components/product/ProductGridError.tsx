"use client";

import { AlertTriangle } from "lucide-react";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

interface ProductGridErrorProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

export function ProductGridError({
  title = "Something went wrong",
  description = "Unable to load products. Please try again.",
  onRetry,
}: ProductGridErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-sm border border-beige bg-secondary/40 px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-error">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <Heading variant="h3" as="h2">
        {title}
      </Heading>
      <Text variant="body" className="max-w-sm text-muted">
        {description}
      </Text>
      <Button type="button" variant="outline" size="md" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
