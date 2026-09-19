import type { Metadata } from "next";
import { siteConfig } from "@/constants/site";

type ClassValue = string | number | boolean | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/**
 * Converts a Pakistani phone number as stored on an order (e.g.
 * "0331 6668233" or "+923316668233") into the digits-only, country-code-first
 * form wa.me click-to-chat links require (e.g. "923316668233").
 */
export function toWhatsAppPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/[\s-]/g, "").replace(/^\+/, "");
  return digitsOnly.startsWith("0") ? `92${digitsOnly.slice(1)}` : digitsOnly;
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

const META_DESCRIPTION_MAX_LENGTH = 155;

/**
 * Turns a long, free-form product description (often written with emoji
 * section headers and bullet lists, e.g. "💫 Description\n...\n\n✨
 * Features:\n- ...") into a single clean sentence suitable for a <meta
 * description> or og:description tag — stripped of emoji/bullets/newlines
 * and cut to a length Google won't truncate mid-word.
 */
export function buildMetaDescription(text: string): string {
  const plain = text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/^[\s\-•*]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= META_DESCRIPTION_MAX_LENGTH) return plain;

  const truncated = plain.slice(0, META_DESCRIPTION_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : META_DESCRIPTION_MAX_LENGTH)}…`;
}

/**
 * Next.js shallow-merges page-level `metadata` into the root layout's, but
 * `openGraph` is replaced wholesale rather than merged field-by-field — so a
 * page that sets `openGraph` without repeating `url`/`siteName`/`type`/
 * `images` silently loses them from the rendered tags. This rebuilds the
 * full object every time so `og:url` (missing site-wide) is present without
 * dropping the rest.
 */
export function buildOpenGraph({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: siteConfig.name,
    url: path,
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  };
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
