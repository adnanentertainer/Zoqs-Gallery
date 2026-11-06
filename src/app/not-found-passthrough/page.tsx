import { notFound } from "next/navigation";

/**
 * Rewrite target used by src/proxy.ts for a missing /product/[slug] or
 * /category/[slug]. Deliberately has no loading.tsx and does no async work
 * before calling notFound() -- nothing has suspended yet, so the response
 * hasn't started streaming, and Next.js can still set a real 404 status
 * (see proxy.ts's checkCatalogResourceExists for the full explanation).
 * Bubbles up to the root not-found.tsx for both its content and its title
 * (verified: a static `metadata` export here is never applied, since
 * notFound() replaces this segment's render before it would take effect)
 * -- the same page a visitor already sees for any other unknown URL.
 */
export default function NotFoundPassthroughPage() {
  notFound();
}
