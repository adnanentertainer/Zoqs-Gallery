/**
 * Only ever allow redirecting back to an internal path. Rejects anything
 * that isn't a single-leading-slash path (blocks protocol-relative URLs like
 * "//evil.com" and absolute URLs) to prevent open-redirect vulnerabilities.
 */
export function getSafeRedirect(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
