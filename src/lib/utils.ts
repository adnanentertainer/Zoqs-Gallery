type ClassValue = string | number | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function categoryLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildUrl(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Safe to inject into a `<script>` via `dangerouslySetInnerHTML` (e.g. JSON-LD
 * structured data). Plain `JSON.stringify` does not escape the sequence
 * "</", so an admin-controlled string field (a product description, say)
 * containing the literal text "</script>" could prematurely close the tag
 * and inject arbitrary markup. Escaping every "<" as its unicode form
 * neutralizes that without changing the parsed JSON value.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
