import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page Not Found | ZOQ's Gallery",
};

/**
 * Rewrite target used by src/proxy.ts for a missing /product/[slug] or
 * /category/[slug]. Deliberately has no loading.tsx and does no async work
 * before calling notFound() -- nothing has suspended yet, so the response
 * hasn't started streaming, and Next.js can still set a real 404 status
 * (see proxy.ts's checkCatalogResourceExists for the full explanation).
 * Bubbles up to the root not-found.tsx for its content, same page a
 * visitor already sees for any other unknown URL.
 */
export default function NotFoundPassthroughPage() {
  notFound();
}
