"use client";

import { ProductGridError } from "@/components/product/ProductGridError";

// Deliberately not wrapped in AdminShell: per Next.js's error-boundary rules,
// error.tsx does not wrap the layout.tsx in its own segment, so this renders
// standalone if /admin/layout.tsx itself is what threw. It still catches
// errors from any nested /admin/* page that doesn't have its own error.tsx.
export default function AdminError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ProductGridError
        title="Something went wrong"
        description="Unable to load this admin page. Please try again."
        onRetry={retry}
      />
    </div>
  );
}
